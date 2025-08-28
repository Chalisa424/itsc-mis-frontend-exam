<template>
    <div>
    <Navbar :breadcrumbs ="crumbs" class="text-3xl font-semibold"/>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-3/4 mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-6">

        <!-- Loading -->
        <div v-if="loading" class="animate-pulse space-y-4">
          <div class="h-8 w-2/3 bg-gray-200 rounded"></div>
          <div class="h-4 w-1/3 bg-gray-200 rounded"></div>
          <div class="h-64 w-full bg-gray-200 rounded"></div>
          <div class="h-4 w-full bg-gray-200 rounded"></div>
          <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>

        <!-- Error / Not found -->
        <div v-else-if="error || !blog">
          <button @click="goBack" class="px-5 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700">
            กลับ
          </button>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Title + status -->
          <div class="flex items-start justify-between">
            <h1 class="text-3xl font-bold text-gray-900 leading-snug">
              {{ blog.title }}
            </h1>
            <span
              class="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full"
              :class="blog.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
              title="สถานะบทความ"
            >
              <span
                class="inline-block w-2 h-2 rounded-full"
                :class="blog.published ? 'bg-green-500' : 'bg-gray-400'"
              ></span>
              {{ blog.published ? 'เผยแพร่' : 'ซ่อน' }}
            </span>
          </div>

          <!-- Meta -->
          <div class="mt-2 flex items-center text-sm text-gray-500">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ formatDate(blog.createdAt) }}
          </div>

          <!-- Image (ถ้ามี) -->
          <div v-if="blog.imageUrl" class="mt-6">
            <img :src="blog.imageUrl" alt="cover" class="max-h-[360px] rounded-lg object-contain mx-auto" />
          </div>

          <!-- Content -->
          <article class="mt-6 text-gray-800 leading-8 text-[17px] whitespace-pre-wrap">
            {{ blog.content }}
          </article>

          <!-- Actions -->
          <div class="mt-8 items-center ">
            <button @click="goBack"
                    class="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              กลับ
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../stores/BlogStore'
import type { Blog } from '../types/blog'
import Navbar from '../components/Navbar.vue'


const route = useRoute()
const router = useRouter()
const store = useBlogStore()

const id = Number(route.params.id)
const loading = ref(true)
const error = ref<string | null>(null)

// ใช้จากแคชใน store ก่อน ถ้าไม่มีค่อย fetch
const blog = computed<Blog | undefined>(() => store.blogs.find(b => b.id === id))

const crumbs = computed<string[]>(()=> [
    blog.value?.title || ''
])

onMounted(async () => {
  try {
    if (!blog.value) await store.fetchBlogById(id)
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'failed'
  } finally {
    loading.value = false
  }
})

const goBack = () => router.back()

const formatDate = (iso: string) => new Date(iso).toLocaleString('th-TH', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
})
</script>
