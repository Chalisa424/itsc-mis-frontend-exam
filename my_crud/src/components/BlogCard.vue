<template>
  <div class="flex border boder-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadaow overflow-hidden">
    <!-- Image -->
    <div class="w-1/4 min-w-[120px] max-w-[200px]">
      <img
        :src="blog.imageUrl || '/placeholder-image.jpg'"
        class="w-full h-full object-cover"
      />
    </div>
    
    <div class="flex-1 p-4 flex flex-col">
      <div class="flex items-start justify-between mb-3">
              <!-- Title -->
      <h3 class="text-xl font-semibold text-gray-600 line-clamp-2 ml-4 flex-1 text-left">
        {{ blog.title }}
      </h3>

      <!-- สถานะ -->
      <div class="flex items-center ">
      <label class="relative inline-flex items-center cursor-pointer">
        <input 
        type="checkbox"
        :checked="blog.published"
        @change="handleToggle"
        class="sr-only peer"
        >
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500">
 
        </div>
        <span class="ml-2 text-sm font-medium text-gray-900">
          {{ blog.published? 'เผยแพร่' : 'ซ่อน' }}
        </span>
      </label>
  </div>
</div>
    
    <!-- Content -->
    <p class="text-gray-600 text-lg mb-4">
      {{ trunContent }}
    </p>

   <!-- Footer: Date and Buttons -->
      <div class="flex items-center justify-between pt-3 ">
        <!-- Date -->
        <div class="flex items-center text-gray-500 text-lg">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {{ formatDate(blog.createAt) }}
        </div>
      </div>

      <!-- ปุ่ม Edit & Delete ไปอยู่ขวาสุดแยกบรรทัด -->
      <div class="flex justify-end space-x-5 mt-3">
        <!-- Edit Button -->
        <button
          @click="handleEdit"
          class="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          title="แก้ไข"
        >
          <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </button>

        <!-- Delete Button -->
        <button
          @click="handleDelete"
          class="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          title="ลบ"
        >
          <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from "vue";
import type { Blog } from "../types/blog";

interface Props {
  blog: Blog;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "edit", id: number): void;
  (e: "delete", id: number): void;
  (e: "toggle", id:number, published:boolean):void;
}>();

// Computed property สำหรับตัดเนื้อหา
const trunContent = computed(() => {
  return props.blog.content.length > 100
    ? props.blog.content.substring(0, 100) + "..."
    : props.blog.content;
});

//  Function จัดรูปแบบวันที่
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
//  Function จัดการ edit
const handleEdit = () => {
  emit("edit", props.blog.id);
};

//  Function จัดการ delete
const handleDelete = () => {
  emit("delete", props.blog.id);
};
</script>
