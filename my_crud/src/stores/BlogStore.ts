import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Blog } from '../types/blog'

export const useBlogStore = defineStore('blog', () => {
  // ----- State
  const blogs = ref<Blog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const showPublishedOnly = ref(false)

  // ----- Getters
  const filteredBlogs = computed(() => {
    let filtered = blogs.value

    // ค้นหาจาก title+content
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(q) ||
          blog.content.toLowerCase().includes(q)
      )
    }

    // filter เฉพาะเผยแพร่
    if (showPublishedOnly.value) {
      filtered = filtered.filter((blog) => blog.published)
    }

    return filtered
  })

  // ----- Mock data (ใช้ createdAt ให้ตรงกัน)
  const sampleData: Blog[] = [
    {
      id: 1,
      title: 'การพัฒนาเว็บแอปด้วย Vue.js และ TypeScript',
      content:
        'Vue.js เป็น framework ที่น่าสนใจสำหรับการพัฒนาเว็บแอปพลิเคชันสมัยใหม่ ด้วยความเรียบง่ายและประสิทธิภาพที่สูง เมื่อรวมกับ TypeScript ทำให้การพัฒนามีความปลอดภัยมากขึ้น',
      imageUrl:
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
      published: true,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      title: 'เรียนรู้ Tailwind CSS ตั้งแต่เริ่มต้น',
      content:
        'Tailwind CSS เป็น utility-first CSS framework ที่ช่วยให้การออกแบบเว็บเร็วและสวยงามยิ่งขึ้น ในบทความนี้จะสอนวิธีการใช้งานพื้นฐาน',
      imageUrl:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      published: false,
      createdAt: '2024-01-14T14:20:00Z',
    },
    {
      id: 3,
      title: 'การตั้งค่า Vite + Vue 3 + TypeScript',
      content:
        'คู่มือการตั้งค่าโปรเจค Vue.js กับ Vite และ TypeScript อย่างละเอียด พร้อมตัวอย่างการใช้งาน',
      imageUrl:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop',
      published: true,
      createdAt: '2024-01-13T09:15:00Z',
    },
  ]


  // force = true จะบังคับโหลดใหม่
  const fetchBlogs = async (force = false) => {
    if (blogs.value.length && !force) return
    loading.value = true
    error.value = null
    try {
      await new Promise((r) => setTimeout(r, 800)) 

      // รวม sampleData + blogs ด้วย id
      const seen = new Set<number>()
      const merged: Blog[] = []
      for (const b of [...blogs.value, ...sampleData]) {
        if (!seen.has(b.id)) {
          seen.add(b.id)
          merged.push(b)
        }
      }
      blogs.value = merged.sort((a, b) => b.id - a.id)
    } catch (e) {
      error.value = 'Failed to fetch blogs'
    } finally {
      loading.value = false
    }
  }

  const addBlog = async (blogData: {
    title: string
    content: string
    image: File | null
    published: boolean
  }) => {
    loading.value = true
    error.value = null
    try {
      let imageUrl: string | undefined
      if (blogData.image) imageUrl = URL.createObjectURL(blogData.image)

      const nextId =
        blogs.value.length > 0
          ? Math.max(...blogs.value.map((b) => b.id)) + 1
          : 1

      const newBlog: Blog = {
        id: nextId,
        title: blogData.title,
        content: blogData.content,
        imageUrl,
        published: blogData.published,
        createdAt: new Date().toISOString(),
      }

      blogs.value.unshift(newBlog)
      return newBlog
    } catch (err) {
      error.value = 'Failed to create blog'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBlog = async (id: number, patch: Partial<Blog>) => {
    const i = blogs.value.findIndex((b) => b.id === id)
    if (i !== -1) {
      blogs.value[i] = { ...blogs.value[i], ...patch }
    }
  }

  const deleteBlog = async (id: number) => {
    loading.value = true
    try {
      blogs.value = blogs.value.filter((b) => b.id !== id)
    } catch (err) {
      error.value = 'Failed to delete blog'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    blogs,
    filteredBlogs,
    loading,
    error,
    searchQuery,
    showPublishedOnly,
    fetchBlogs,
    addBlog,
    updateBlog,
    deleteBlog,
  }
})
