<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="max-w-9/10 mx-auto">
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">บทความ</h1>
        </div>
        
        <!-- Add Button -->
        <button class="bg-blue-600 hover:bg-blue-700 text-lg text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          เพิ่มบทความ
        </button>
      </div>

      <!-- Search and Filer -->
      <SearchBar />
      <div class="p-6 mb-6">
          <!-- Filter Checkbox -->
          <div class="flex items-center">
            <label class="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="showAllBlogs"
                class="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              >
              <span class="ml-2 text-lg text-gray-700">แสดงบทความทั้งหมด</span>
            </label>
          </div>
        </div>
     

      <!-- Blog List -->
      <div class="space-y-4">
        <BlogCard 
          v-for="blog in filteredBlogs"
          :key="blog.id"
          :blog="blog"
          @edit="handleEditBlog"
          @delete="handleDeleteBlog"
          @toggle="handleToggleBlog"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredBlogs.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-gray-600 text-lg">ไม่พบบทความ</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BlogCard from '../components/BlogCard.vue';
import type { Blog } from '@/types/blog';
import SearchBar from '../components/SearchBar.vue';
const showAllBlogs = ref(true);

const sampleBlogs = ref<Blog[]>([
  {
    id: 1,
    title: 'การพัฒนาเว็บแอปด้วย Vue.js และ TypeScript',
    content: 'Vue.js เป็น framework ที่น่าสนใจสำหรับการพัฒนาเว็บแอปพลิเคชันสมัยใหม่ ด้วยความเรียบง่ายและประสิทธิภาพที่สูง เมื่อรวมกับ TypeScript ทำให้การพัฒนามีความปลอดภัยมากขึ้น',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    published: true,
    createAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: 'เรียนรู้ Tailwind CSS ตั้งแต่เริ่มต้น',
    content: 'Tailwind CSS เป็น utility-first CSS framework ที่ช่วยให้การออกแบบเว็บเร็วและสวยงามยิ่งขึ้น ในบทความนี้จะสอนวิธีการใช้งานพื้นฐาน',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    published: false,
    createAt: '2024-01-14T14:20:00Z'
  },
  {
    id: 3,
    title: 'การตั้งค่า Vite + Vue 3 + TypeScript',
    content: 'คู่มือการตั้งค่าโปรเจค Vue.js กับ Vite และ TypeScript อย่างละเอียด พร้อมตัวอย่างการใช้งาน',
    imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop',
    published: true,
    createAt: '2024-01-13T09:15:00Z'
  }
]);

// Filter blogs based on checkbox
const filteredBlogs = computed(() => {
  if (showAllBlogs.value) {
    return sampleBlogs.value;
  }
  return sampleBlogs.value.filter(blog => blog.published);
});

const handleEditBlog = (blogId: number) => {
  console.log('แก้ไขบทความ ID:', blogId);
  alert(`กำลังแก้ไขบทความ ID: ${blogId}`);
};

const handleDeleteBlog = (blogId: number) => {
  console.log('ลบบทความ ID:', blogId);
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?')) {
    sampleBlogs.value = sampleBlogs.value.filter(blog => blog.id !== blogId);
    alert(`ลบบทความ ID: ${blogId} เรียบร้อยแล้ว`);
  }
};

const handleToggleBlog = (blogId: number, published: boolean) => {
  const blog = sampleBlogs.value.find(b => b.id === blogId);
  if (blog) {
    blog.published = published;
    console.log(`เปลี่ยนสถานะบทความ ID: ${blogId} เป็น ${published ? 'เผยแพร่' : 'ซ่อน'}`);
  }
};
</script>