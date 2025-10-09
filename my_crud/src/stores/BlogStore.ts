import { ref, computed } from 'vue';
import http, { API_BASE_URL } from '../services/apiClient';
import type { Blog } from '../types/blog';
import type { BlogApi, BlogListResponse } from '../types/api';

const API_ORIGIN = (API_BASE_URL ?? '').replace(/\/api\/?$/, '');

function normalizeImgUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const path = url.replace(/\\/g, '/');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
}

function toAppModel(b: BlogApi): Blog {
  return {
    id: b.id,
    title: b.title,
    content: b.content,
    imageUrl: normalizeImgUrl(b.Img?.url),
    published: b.active,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    hit: b.hit,
    pin: b.pin,
  };
}

export function useBlogStore() {
  const blogs = ref<Blog[]>([]);
  const blog = ref<Blog | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery =ref('');


  // GET /blogs
  async function fetchBlogs(param?: { page?: number; size?: number; q?: string; show?: 'all' | 'active' }) {
    loading.value = true;
    error.value = null;

    const page = param?.page ?? 1;
    const size = param?.size ?? 10000;
    const show = param?.show ?? 'all';
    const q = param?.q?.trim();

    try {
      const params: any = { page, size, show };
      if (q) params.q = q;

      const res = await http.get<BlogListResponse>('/blogs', { params });

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
      error.value = e?.response?.data?.error || 'Failed to fetch blogs';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // GET /blogs/:id
  async function fetchBlogById(id: number) {
    loading.value = true;
    error.value = null;
     try {
    const res = await http.get<BlogApi>(`/blogs/${id}`);
    console.log('API Response for blog:', res.data); // เพิ่ม log
    const b = toAppModel(res.data);
    console.log('After conversion:', b); // เพิ่ม log
    blog.value = b;
    const i = blogs.value.findIndex((x) => x.id === id);
    if (i === -1) blogs.value.unshift(b);
    else blogs.value[i] = b;
    return b;
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to fetch blog';
    throw e;
  } finally {
    loading.value = false;
  }
}

  // POST /blogs
  async function addBlog(payload: { title: string; content: string; image?: File | null; published: boolean }) {
    loading.value = true;
    error.value = null;
    try {
      const fd = new FormData();
      fd.append('title', payload.title);
      fd.append('content', payload.content);
      fd.append('active', String(payload.published));
      if (payload.image) fd.append('blog_img', payload.image);

      const res = await http.post<BlogApi>('/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const created = toAppModel(res.data);
      blogs.value.unshift(created);
      return created;
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to create blog';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // PUT /blogs/:id
  async function updateBlog(id: number, payload: { title?: string; content?: string; image?: File | null; published?: boolean }) {
    loading.value = true;
    error.value = null;

    const blogId = Number(id);
    if (!Number.isFinite(blogId)) throw new Error('Invalid blog id');

    const idx = blogs.value.findIndex((b) => b.id === blogId);
    const hadLocal = idx !== -1;
    const prev = hadLocal ? { ...blogs.value[idx] } : null;

    try {
      const fd = new FormData();
      if (payload.title !== undefined) fd.append('title', payload.title);
      if (payload.content !== undefined) fd.append('content', payload.content);
      if (payload.published !== undefined) fd.append('active', String(payload.published));
      if (payload.image) fd.append('blog_img', payload.image);

      const res = await http.put<BlogApi>(`/blogs/${blogId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = toAppModel(res.data);

      const merged: Blog = hadLocal
        ? { ...prev!, ...updated, id: prev!.id, imageUrl: updated.imageUrl ?? prev!.imageUrl }
        : updated;

      if (hadLocal) blogs.value[idx] = merged;
      else blogs.value.unshift(merged);

      if (blog.value?.id === blogId) blog.value = merged;

       return merged;
    } catch (e: any) {
      if (hadLocal && prev) blogs.value[idx] = prev;
      error.value = e?.response?.data?.error || 'Failed to update blog';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // DELETE /blogs/:id
  async function deleteBlog(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await http.delete(`/blogs/${id}`);
      blogs.value = blogs.value.filter((b) => b.id !== id);
      if (blog.value?.id === id) blog.value = null;
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to delete blog';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // PUT /blogs/:id/remove-image
  async function removeImage(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await http.put(`/blogs/${id}/remove-image`);
      const i = blogs.value.findIndex((b) => b.id === id);
      if (i !== -1) blogs.value[i] = { ...blogs.value[i], imageUrl: null };
      if (blog.value?.id === id) blog.value = { ...blog.value, imageUrl: null };
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to remove image';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // POST /blogs/delete
  async function deleteMany(ids: number[]) {
    loading.value = true;
    error.value = null;
    try {
      await http.post('/blogs/delete', { ids });
      const set = new Set(ids);
      blogs.value = blogs.value.filter((b) => !set.has(b.id));
      if (blog.value && set.has(blog.value.id)) blog.value = null;
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to delete blogs';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    // state (refs)
    blogs,
    blog,
    loading,
    error,
    searchQuery,
    // actions
    fetchBlogs,
    fetchBlogById,
    addBlog,
    updateBlog,
    deleteBlog,
    removeImage,
    deleteMany,
  };
}