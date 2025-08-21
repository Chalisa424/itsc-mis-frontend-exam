<template>
    <div class="w-full mx-auto bg-gray-50 p-4">
        <header class="relative">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">บทความ</h1> 
             
            <button type="submit" class="mb-2 text-white absolute end-2.5 bottom-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-4xl text-2xl px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                + เพิ่มบทความ
            </button>  
        </header>
        <SearchBar />
        <main class=" w-full mx-auto p-10 mx-auto ">
            <div class="container grid grid-col-1 gap-6">
                <BlogCard 
                v-for="blog in sampleBlogs"
                :key="blog.id"
                :blog="blog"
                @edit="handleEditBlog"
                @delete="handleDeleteBlog"
                />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BlogCard from '../components/BlogCard.vue';
import type {Blog} from '@/types/blog'
import SearchBar from '../components/SearchBar.vue';


const sampleBlogs = ref<Blog[]>([
    {
    id: 1,
    title: 'การพัฒนาเว็บแอปด้วย Vue.js และ TypeScript',
    content: 'Vue.js เป็น framework ที่น่าสนใจสำหรับการพัฒนาเว็บแอปพลิเคชันสมัยใหม่ ด้วยความเรียบง่ายและประสิทธิภาพที่สูง เมื่อรวมกับ TypeScript ทำให้การพัฒนามีความปลอดภัยมากขึ้น',
    published: true,
    createAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: 'เรียนรู้ Tailwind CSS ตั้งแต่เริ่มต้น',
    content: 'Tailwind CSS เป็น utility-first CSS framework ที่ช่วยให้การออกแบบเว็บเร็วและสวยงามยิ่งขึ้น ในบทความนี้จะสอนวิธีการใช้งานพื้นฐาน',
    published: false,
    createAt: '2024-01-14T14:20:00Z'
  },
  {
    id: 3,
    title: 'การตั้งค่า Vite + Vue 3 + TypeScript',
    content: 'คู่มือการตั้งค่าโปรเจค Vue.js กับ Vite และ TypeScript อย่างละเอียด พร้อมตัวอย่างการใช้งาน',
    published: true,
    createAt: '2024-01-13T09:15:00Z'
  }
])

const handleEditBlog = (blogId: number)=>{
    console.log('Edite Content ID:', blogId)
    alert(`กำลังแก้ไขบทความ ID: ${blogId}`)
}

const handleDeleteBlog = (blogId: number)=>{
    console.log('Delete Content ID:', blogId)
    alert(`กำลังลบบทความ ID: ${blogId}`)
}
</script>
