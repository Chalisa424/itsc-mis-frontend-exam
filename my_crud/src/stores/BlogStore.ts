import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Blog } from "../types/blog";

export const useBlogStore = defineStore("blog", () => {
  //State
  const blogs = ref<Blog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref("");
  const showPublishedOnly = ref(false);

  //Getter
  const filteredBlogs = computed(() => {
  let filtered = blogs.value;

    //Filter by search query
    if (searchQuery.value) {
      filtered = filtered.filter(
        (blog :Blog) =>
          blog.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    //Filter by published status
    if (showPublishedOnly.value) {
      filtered = filtered.filter((blog: Blog) => blog.published);
    }
    return filtered;
  });

  //Actions
  const fetchBlogs = async () => {
    loading.value = true;
    error.value = null;
    try {
      //ยังไม่ได้เชื่อม API
      setTimeout(() => {
        blogs.value = [
          {
            id: 1,
            title: "การพัฒนาเว็บแอปด้วย Vue.js และ TypeScript",
            content:
              "Vue.js เป็น framework ที่น่าสนใจสำหรับการพัฒนาเว็บแอปพลิเคชันสมัยใหม่ ด้วยความเรียบง่ายและประสิทธิภาพที่สูง เมื่อรวมกับ TypeScript ทำให้การพัฒนามีความปลอดภัยมากขึ้น",
            imageUrl:
              "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
            published: true,
            createAt: "2024-01-15T10:30:00Z",
          },
          {
            id: 2,
            title: "เรียนรู้ Tailwind CSS ตั้งแต่เริ่มต้น",
            content:
              "Tailwind CSS เป็น utility-first CSS framework ที่ช่วยให้การออกแบบเว็บเร็วและสวยงามยิ่งขึ้น ในบทความนี้จะสอนวิธีการใช้งานพื้นฐาน",
            imageUrl:
              "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
            published: false,
            createAt: "2024-01-14T14:20:00Z",
          },
          {
            id: 3,
            title: "การตั้งค่า Vite + Vue 3 + TypeScript",
            content:
              "คู่มือการตั้งค่าโปรเจค Vue.js กับ Vite และ TypeScript อย่างละเอียด พร้อมตัวอย่างการใช้งาน",
            imageUrl:
              "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop",
            published: true,
            createAt: "2024-01-13T09:15:00Z",
          },
        ];
        loading.value = false;
      }, 1000);
    } catch (err) {
      error.value = "Failed to fetch blogs";
    }
  };

  const addBlog = async (blog: Omit<Blog, 'id' | 'createAt'>) => {

  }

  const updateBlog = async (id: number, blog: Partial<Blog>) =>{

  }

  const deleteBlog = async (id: number) => {

  }

  return{
    blogs,
    filteredBlogs,
    loading,
    error,
    searchQuery,
    showPublishedOnly,
    fetchBlogs,
    addBlog,
    updateBlog,
    deleteBlog
  }
});
