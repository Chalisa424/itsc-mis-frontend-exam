import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient, { API_BASE_URL } from "../services/apiClient";
import type { Blog } from "../types/blog";
import type { BlogApi, BlogListResponse } from "../types/api";
import http from "../services/apiClient";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function normalistImgUrl(url?: string | null): string | null {
  if (!url) return null;
  //แปลงเป็น "/uploads/blogs/..."

  const isAbsolute = /^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')
  if (isAbsolute) return url

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
    hit: b.hit,//จำนวนครั้งที่บทความถูกเปิดดู (view count)
    pin: b.pin,//บทความนั้นถูก “ปักหมุด” ไว้บนสุดมั้ย
  };
}

export const useBlogStore = defineStore("blog", () => {
  // ----- State
  const blogs = ref<Blog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

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
      blogs.value = res.data.rows.map(toAppModel);
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

  //Put /Blogs/:id
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

    const i = blogs.value.findIndex((b) => b.id === id);
    if (i === -1) throw new Error("Blog not Found");

    const isToggleOnly =
      payload.published !== undefined &&
      payload.title === undefined &&
      payload.content === undefined &&
      payload.image == null;

    if (isToggleOnly) {
      try {
        await http.put<BlogApi>( 
          `/blogs/${id}`,
          { active: payload.published },
          { headers: {"Content-Type": "application/json"}}
        );
      } catch (e: any) {
        error.value = e?.response?.data?.error;
        throw e;
      }
    }

    const prev = { ...blogs.value[i] }; // เผื่อ rollback
    loading.value = true;
    blogs.value[i] = {
      ...blogs.value[i],
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.content !== undefined ? { content: payload.content } : {}),
    };

    try {
      let res;
      if (payload.image) {
        const fd = new FormData();
        if (payload.title != null) fd.append("title", payload.title);
        if (payload.content != null) fd.append("content", payload.content);
        if (payload.published != null) fd.append("active", payload.published.toString());
          fd.append("blog_img", payload.image);

        res = await http.put<BlogApi>(`/blogs/${id}`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const body: Record<string, any> = {};
        if (payload.title != null) body.title = payload.title;
        if (payload.content != null) body.content = payload.content;
        if (payload.published != null) body.active = payload.published;
        res = await http.put<BlogApi>(`/blogs/${id}`, body, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const updated = toAppModel(res.data);
      blogs.value[i] = updated;
      return updated;
    } catch (e: any) {
      blogs.value[i] = prev;
      error.value = e?.response?.data?.error;
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
