<template>
  <nav class="bg-blue-500 text-white font-semibold shadow-md border-gray-200">
    <div class="flex flex-wrap justify-between mx-auto px-10 py-5">
      <div >
      <!-- link กลับไป blog -->
      <router-link
      to="/blogs"
      class="text-3xl">บทความ</router-link>
      <span v-for="(crum , index) in breadcrumbs" :key="index"> / {{ crum }}</span>
    
      </div>
      
      <slot name="right"></slot>
      
      <div class="flex space-x-6">
        <svg
          class="w-6 h-6 text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8h11m0 0-4-4m4 4-4 4m-5 3H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h3"
          />
        </svg>
        
        <a
          href="#"
          class="text-2xl text-white hover:underline hover:text-blue-500"
          >Logout</a
        >
      </div>
    </div>
  </nav>
</template>
<script setup lang="ts">
defineProps<{
  breadcrumbs?: string[]
}>()
</script>

