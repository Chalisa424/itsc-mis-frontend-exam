import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient, { API_BASE_URL } from "../services/apiClient";
import type { Blog } from "../types/blog";
import type { BlogApi, BlogListResponse } from "../types/api";
import http from "../services/apiClient";

const API_ORIGIN = (API_BASE_URL ?? "").replace(/\/api\/?$/, "");

function normalistImgUrl(url?: string | null): string | null {
  if (!url) return null;
  //แปลงเป็น "/uploads/blogs/..."

  const isAbsolute =
    /^https?:\/\//i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:");
  if (isAbsolute) return url;

  const path = url.replace(/\\/g, "/");
  // ทำเป็น absolute URL

  // ถ้า path ไม่เริ่มด้วย / ให้เพิ่ม / นำหน้า
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_ORIGIN}${normalizedPath}`;
}

//แปลง Blog จาก APIแบบที่ UI ใช้ Map feild มาจาก model api.ts
function toAppModel(b: BlogApi): Blog {
  return {
    id: b.id,
    title: b.title,
    content: b.content,
    imageUrl: normalistImgUrl(b.Img?.url),
    published: b.active,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    hit: b.hit, //จำนวนครั้งที่บทความถูกเปิดดู (view count)
    pin: b.pin, //บทความนั้นถูก “ปักหมุด” ไว้บนสุดมั้ย
  };
}

export const useBlogStore = defineStore("blog", () => {
  // ----- State
  const blogs = ref<Blog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  //state สำหรับค้นหา
  const searchQuery = ref<string>("");

  // ----- Actions (CRUD / side-effects เท่านั้น)
  // Get /blogs รองรับ page/size/q/show
  const fetchBlogs = async (param?: {
    page?: number;
    size?: number;
    q?: string;
    show?: "all" | "active";
  }) => {
    loading.value = true;
    error.value = null;

    let page = 1;
    let size = 10000;
    let q: string | undefined = undefined;
    let show: "all" | "active" = "all";
    if (param) {
      if (param.page !== undefined && param.page !== null) page = param.page;

      if (param.size !== undefined && param.size !== null) size = param.size;

      if (param.q !== undefined && param.q !== null) q = param.q;

      if (param.show !== undefined && param.show !== null) show = param.show;
    }

    try {
      const res = await http.get<BlogListResponse>("/blogs", {
        params: { page, size, q, show },
      });

      const payload = res.data as any;
      const rows: any[] = Array.isArray(payload?.rows)
        ? payload.rows
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      blogs.value = rows.map(toAppModel);
      return res.data;
    } catch (e: any) {
      error.value = e?.response?.data?.error || "Failed to fetch blogs";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Get /blogs/:id
  const fetchBlogById = async (id: number): Promise<Blog> => {
    loading.value = true;
    error.value = null;
    try {
      const res = await http.get<BlogApi>(`/blogs/${id}`);
      const blog = toAppModel(res.data);

      const i = blogs.value.findIndex((b) => b.id === id);
      if (i === -1) blogs.value.unshift(blog);
      else blogs.value[i] = blog;
      return blog;
    } catch (e: any) {
      error.value = e?.response?.data?.error || "Failed to fetch blogs";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Post /blogs
  const addBlog = async (payload: {
    title: string;
    content: string;
    image?: File | null;
    published: boolean;
  }): Promise<Blog> => {
    loading.value = true;
    error.value = null;
    try {
      const fd = new FormData();
      fd.append("title", payload.title);
      fd.append("content", payload.content);
      fd.append("active", payload.published.toString());

      if (payload.image) {
        fd.append("blog_img", payload.image);
      }

      const res = await http.post<BlogApi>("/blogs", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const blog = toAppModel(res.data);
      blogs.value.unshift(blog);
      return blog;
    } catch (e: any) {
      error.value = e?.response?.data?.error || "Failed to create blog";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /// Put /blogs/:id  
  const updateBlog = async (
    id: number,
    payload: {
      title?: string;
      content?: string;
      image?: File | null;
      published?: boolean;
    }
  ): Promise<Blog> => {
    error.value = null;

    // ให้ id เป็นตัวเลขที่ใช้ได้
    const blogId = Number(id);
    if (!Number.isFinite(blogId)) {
      throw new Error("Invalid blog id");
    }

    // หาใน store ถ้ามีจะใช้ทำ rollback/merge ถ้าไม่มีก็ไม่ต้อง throw ปล่อยอัปเดตต่อได้
    let i = blogs.value.findIndex((b) => b.id === blogId);
    const hadLocal = i !== -1;
    const prev = hadLocal ? { ...blogs.value[i] } : null;

    loading.value = true;
    try {
      // ถ้าไม่มีใน store ให้ใช้ค่า fallback เปล่า ๆ
      const current: Partial<Blog> = hadLocal
        ? blogs.value[i]
        : { title: "", content: "", published: false };

      const title = payload.title ?? current.title ?? "";
      const content = payload.content ?? current.content ?? "";
      const activeBool = payload.published ?? current.published ?? false;

      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      fd.append("active", activeBool.toString());
      if (payload.image) fd.append("blog_img", payload.image);

      const res = await http.put<BlogApi>(`/blogs/${blogId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = toAppModel(res.data);
      //Merge โดย คง id เดิมและ preserve รูปเดิมถ้า response ไม่ส่งกลับมา
      const merged: Blog = hadLocal
        ? { ...prev!, ...updated, id:prev!.id, imageUrl: updated.imageUrl ?? prev!.imageUrl }
        : updated;

      if (hadLocal) {
        blogs.value[i] = merged;
      } else {
        // ถ้ายังไม่มีใน store แทรกเข้าไป 
        blogs.value.unshift(merged);
      }
      return merged;
    } catch (e: any) {
      if (hadLocal && prev) blogs.value[i] = prev; // rollback เฉพาะกรณีมีใน store
      error.value = e?.response?.data?.error || "Failed to update blog";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Delete  /blogs/:id
  const deleteBlog = async (id: number) => {
    loading.value = true;
    error.value;
    try {
      await http.delete(`/blogs/${id}`);
      blogs.value = blogs.value.filter((b) => b.id !== id);
    } catch (e: any) {
      error.value = e?.response?.data?.error || "Failed to delete blog";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Put /blogs/:id/remove-image
  const removeImage = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await http.put(`/blogs/${id}/remove-image`);
      const i = blogs.value.findIndex((b) => b.id === id);
      if (i !== -1) blogs.value[i] = { ...blogs.value[i], imageUrl: null };
    } catch (e: any) {
      error.value = e?.response?.data?.error || "Failed to remove image";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // POST /blogs/delete  { ids: number[] }
  const deleteMany = async (ids: number[]) => {
    loading.value = true;
    error.value = null;
    try {
      await http.post("/blogs/delete", { ids });
      const set = new Set(ids);
      blogs.value = blogs.value.filter((b) => !set.has(b.id));
    } catch (e: any) {
      error.value = e?.response?.data?.error || "Failed to delete blogs";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    //state
    blogs,
    loading,
    error,
    searchQuery,
    //action
    fetchBlogs,
    fetchBlogById,
    addBlog,
    updateBlog,
    deleteBlog,
    removeImage,
    deleteMany,
  };
});
