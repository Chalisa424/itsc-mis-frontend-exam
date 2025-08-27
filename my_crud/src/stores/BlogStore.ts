import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient, {API_BASE_URL} from '../services/apiClient'
import type { Blog } from '../types/blog'
import type {BlogApi, BlogListResponse} from '../types/api'
import http from '../services/apiClient'

function normalistImgUrl(url?:string | null): string| null{
  if (!url) return null
  //แปลงเป็น "/uploads/blogs/..."
  const path =url.replace(/\\/g, '/')
  // ทำเป็น absolute URL
  return `${API_BASE_URL}${path.startsWith('/') ? '': '/'}${path}`
}

//แปลง Blog จาก APIแบบที่ UI ใช้
function toAppModel(b: BlogApi): Blog{
  return {
    id: b.id,
    title: b.title,
    content: b.content,
    imageUrl: normalistImgUrl(b.Img?.url),
    published: b.active,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    hit: b.hit,
    pin: b.pin
  }
}

export const useBlogStore = defineStore('blog', () => {
  // ----- State
  const blogs = ref<Blog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  // ฟิลเตอร์ฝั่ง UI
  const searchQuery = ref('')
  const showOnlyActive = ref(false)

  // ----- Getters
  const filteredBlogs = computed(() => {
    let list = blogs.value

    // ค้นหาจาก title+content
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(
        b => b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)
      )
    }
    if (showOnlyActive.value) 
      list = list.filter((b) => b.published)
    return list
  })


  // Get /blogs รองรับ page/size/q/show
  const fetchBlogs = async (param?: {
    page?: number
    size?: number
    q?: string
    show?: 'all' | 'active'
  })=> {
    loading.value = true
    error.value = null

    let page = 1
    let size = 10000
    let q: string | undefined = undefined
    let show: 'all' | 'active' = showOnlyActive.value ? 'active' : 'all'
    if (param){
      if(param.page !== undefined && param.page !== null)page = param.page 
    
      if(param.size !== undefined && param.size !== null)size = param.size
    
      if(param.q !== undefined && param.q !== null)q = param.q
    
      if(param.show !== undefined && param.show !== null) show = param.show 
    }

    try{
      const res = await http.get<BlogListResponse>('/blogs',{
        params:{page, size, q, show },
      })
      console.log("API blog:",res.status, res.data)
      blogs.value = res.data.rows.map(toAppModel)
      console.log('[STORE] blogs after map ->', blogs.value.length)
      return res.data
    }catch (e:any){
       console.log("blog after map", e?.response?.status, e?.response?.data || e)
      error.value = e?.response?.data?.error || 'Failed to fetch blogs'
      throw e
    }finally{
      loading.value =false
    }
  }
  
  // Get /blogs/:id
  const fetchBlogById = async(id:number): Promise<Blog> => {
    loading.value = true
    error.value = null
    try{
      const res = await http.get<BlogApi>(`/blogs/${id}`)
      const blog = toAppModel(res.data)

      const i = blogs.value.findIndex(b => b.id === id)
      if (i === -1) blogs.value.unshift(blog)
        else blogs.value[i] = blog
      return blog
    }catch(e: any){
      error.value = e?.response?.data?.error || 'Failed to fetch blogs'
      throw e
    }finally{
      loading.value = false
    }
  }

   // Post /blogs  
  const addBlog = async (payload: {
    title: string
    content: string
    image?: File | null
    published: boolean
  }): Promise<Blog> => {
    loading.value = true
    error.value = null
    try{
      let res
      if (payload.image){
        const fd = new FormData()
        fd.append('title',payload.title)
        fd.append('content', payload.content)
        fd.append('blog_img', payload.image)
        res = await http.post<BlogApi>('/blogs', fd)
      }else{
        res = await http.post<BlogApi>('blogs', {
          title: payload.title,
         content: payload.content,
        })
      }
      const blog = toAppModel(res.data)
      blogs.value.unshift(blog)
      return blog
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to create blog'
      throw e
    } finally {
      loading.value = false
    }
  }


  //Put /Blogs/:id
  const updateBlog = async (id: number, payload: {
    title?: string
    content?: string
    image?: File | null
    published?: boolean
  }): Promise<Blog> => {
    loading.value = true
    error.value = null
    try {
      let res
      if (payload.image) {
        const fd = new FormData()
        if (payload.title != null) fd.append('title', payload.title)
        if (payload.content != null) fd.append('content', payload.content)
        fd.append('blog_img', payload.image)
        res = await http.put<BlogApi>(`/blogs/${id}`, fd)
      } else {
        const body: Record<string, any> = {}
        if (payload.title != null) body.title = payload.title
        if (payload.content != null) body.content = payload.content
        res = await http.put<BlogApi>(`/blogs/${id}`, body)
      }
      const blog = toAppModel(res.data)
      const i = blogs.value.findIndex(b => b.id === id)
      if (i !== -1) blogs.value[i] = blog
      else blogs.value.unshift(blog)
      return blog
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to update blog'
      throw e
    } finally {
      loading.value = false
    }
  }
  
  // Delete  /blogs/:id
  const deleteBlog = async (id: number) => {
    loading.value = true
    error.value
    try {
      await http.delete(`/blogs/${id}`)
      blogs.value = blogs.value.filter((b) => b.id !== id)
    } catch (e: any) {
      error.value = e?.response?.data?.error ||'Failed to delete blog'
      throw e
    } finally {
      loading.value = false
    }
  }

 // Put /blogs/:id/remove-image
  const removeImage = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await http.put(`/blogs/${id}/remove-image`)
      const i = blogs.value.findIndex(b => b.id === id)
      if (i !== -1) blogs.value[i] = { ...blogs.value[i], imageUrl: null }
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to remove image'
      throw e
    } finally {
      loading.value = false
    }
  }

    // POST /blogs/delete  { ids: number[] }
  const deleteMany = async (ids: number[]) => {
    loading.value = true
    error.value = null
    try {
      await http.post('/blogs/delete', { ids })
      const set = new Set(ids)
      blogs.value = blogs.value.filter(b => !set.has(b.id))
    } catch (e: any) {
      error.value = e?.response?.data?.error || 'Failed to delete blogs'
      throw e
    } finally {
      loading.value = false
    }
  }


  return {
    //state
    blogs,
    loading,
    error,
    searchQuery,
    showOnlyActive,

    //getter
    filteredBlogs,

    //action
    fetchBlogs,
    fetchBlogById,
    addBlog,
    updateBlog,
    deleteBlog,
    removeImage,
    deleteMany
  }
})
