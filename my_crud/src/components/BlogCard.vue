<template>
  <div class="flex border boder-gray-200 rounded-lg p-4 bg-white shadow-sm">
    <!-- Image -->
    <div class="w-1/3 min-w-[120px] max-w-[200px]">
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
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        <span class="ml-2 text-sm font-medium text-gray-900">
          {{ blog.published? 'เผยแพร่' : 'ซ่อน' }}
        </span>
      </label>
  </div>

    </div>
    
    <!-- Content -->
    <p class="text-gray-600 text-lg mb-3 line-clamp-3">
      {{ trunContent }}
    </p>

    <!-- Date -->
    <div class="flex items-center text-gray-500 text-base mb-3">
      <svg
        class="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      {{ formatDate(blog.createAt) }}
    </div>

    <!--  Button -->  
      <!-- Edit & Delete -->
      <div class="flex space-x-2 items-left">
        <!-- Edit Button -->
        <button
          @click="handleEdit"
          class="p-2 bg-blue-500 text-white rounded honver:bg-blue-600 transition-colors"
          title="Edit"
        >
          <svg
            class="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        <!-- Delete Button -->
        <button
          @click="handleDelete"
          class="p-2 bg-red-500 text-white rounded honver:bg-blue-600 transition-colors"
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
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