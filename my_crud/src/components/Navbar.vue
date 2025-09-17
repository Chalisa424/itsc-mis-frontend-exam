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
    
       <LogoutButton />
    </div>
  </nav>
</template>
<script setup lang="ts">
import LogoutButton from './LogoutButton.vue';

defineProps<{
  breadcrumbs?: string[]
}>()
</script>

