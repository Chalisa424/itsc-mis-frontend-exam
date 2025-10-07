import { toRefs, reactive } from 'vue';
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
  const state =reactive({
    blogs: [] as Blog[],
    blog: null as Blog | null,
    loading: false,
    error: null as string | null,
    searchQuery:'',
  });

  // GET /blogs
  async function fetchBlogs(param?: { page?: number; size?: number; q?: string; show?: 'all' | 'active' }) {
    state.loading = true;
    state.error = null;

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

      state.blogs = rows.map(toAppModel);
      return res.data;
    } catch (e: any) {
      state.error = e?.response?.data?.error || 'Failed to fetch blogs';
      throw e;
    } finally {
      state.loading = false;
    }
  }

  // GET /blogs/:id
  async function fetchBlogById(id: number) {
    state.loading = true;
    state.error = null;
     try {
    const res = await http.get<BlogApi>(`/blogs/${id}`);
    console.log('API Response for blog:', res.data); // เพิ่ม log
    const b = toAppModel(res.data);
    console.log('After conversion:', b); // เพิ่ม log
    state.blog = b;
    const i = state.blogs.findIndex((x) => x.id === id);
    if (i === -1) state.blogs.unshift(b);
    else state.blogs[i] = b;
    return b;
  } catch (e: any) {
    state.error = e?.response?.data?.error || 'Failed to fetch blog';
    throw e;
  } finally {
    state.loading = false;
  }
}

  // POST /blogs
  async function addBlog(payload: { title: string; content: string; image?: File | null; published: boolean }) {
    state.loading = true;
    state.error = null;
    try {
      const fd = new FormData();
      fd.append('title', payload.title);
      fd.append('content', payload.content);
      fd.append('active', String(payload.published));
      if (payload.image) fd.append('blog_img', payload.image);

      const res = await http.post<BlogApi>('/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const created = toAppModel(res.data);
      state.blogs.unshift(created);
      return created;
    } catch (e: any) {
      state.error = e?.response?.data?.error || 'Failed to create blog';
      throw e;
    } finally {
      state.loading = false;
    }
  }

  // PUT /blogs/:id
  async function updateBlog(id: number, payload: { title?: string; content?: string; image?: File | null; published?: boolean }) {
    state.loading = true;
    state.error = null;

    const blogId = Number(id);
    if (!Number.isFinite(blogId)) throw new Error('Invalid blog id');

    const idx = state.blogs.findIndex((b) => b.id === blogId);
    const hadLocal = idx !== -1;
    const prev = hadLocal ? { ...state.blogs[idx] } : null;

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

      if (hadLocal) state.blogs[idx] = merged;
      else state.blogs.unshift(merged);

      if (state.blog?.id === blogId) state.blog = merged;

       return merged;
    } catch (e: any) {
      if (hadLocal && prev) state.blogs[idx] = prev;
      state.error = e?.response?.data?.error || 'Failed to update blog';
      throw e;
    } finally {
      state.loading = false;
    }
  }

  // DELETE /blogs/:id
  async function deleteBlog(id: number) {
    state.loading = true;
    state.error = null;
    try {
      await http.delete(`/blogs/${id}`);
      state.blogs = state.blogs.filter((b) => b.id !== id);
      if (state.blog?.id === id) state.blog = null;
    } catch (e: any) {
      state.error = e?.response?.data?.error || 'Failed to delete blog';
      throw e;
    } finally {
      state.loading = false;
    }
  }

  // PUT /blogs/:id/remove-image
  async function removeImage(id: number) {
    state.loading = true;
    state.error = null;
    try {
      await http.put(`/blogs/${id}/remove-image`);
      const i = state.blogs.findIndex((b) => b.id === id);
      if (i !== -1) state.blogs[i] = { ...state.blogs[i], imageUrl: null };
      if (state.blog?.id === id) state.blog = { ...state.blog, imageUrl: null };
    } catch (e: any) {
      state.error = e?.response?.data?.error || 'Failed to remove image';
      throw e;
    } finally {
      state.loading = false;
    }
  }

  // POST /blogs/delete
  async function deleteMany(ids: number[]) {
    state.loading = true;
    state.error = null;
    try {
      await http.post('/blogs/delete', { ids });
      const set = new Set(ids);
      state.blogs = state.blogs.filter((b) => !set.has(b.id));
      if (state.blog && set.has(state.blog.id)) state.blog = null;
    } catch (e: any) {
      state.error = e?.response?.data?.error || 'Failed to delete blogs';
      throw e;
    } finally {
      state.loading = false;
    }
  }

  return {
    // return ค่าโดยตรงจาก reactive state
   ...toRefs(state),
    fetchBlogs,
    fetchBlogById,
    addBlog,
    updateBlog,
    deleteBlog,
    removeImage,
    deleteMany,
  };
}