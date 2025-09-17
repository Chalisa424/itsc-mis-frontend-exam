<!-- src/components/LogoutButton.vue -->
<template>
  <button
    class="flex items-center gap-2 px-3 py-2 text-1xl text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-60"
    @click="handleLogout"
    :disabled="loading"
  >
    <svg
      class="w-4 h-4 text-white"
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
    <span v-if="!loading" class="text-1xl">ออกจากระบบ</span>
    <span v-else>กำลังออกจากระบบ...</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/AuthStore'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)

async function handleLogout() {
  if (loading.value) return
  loading.value = true
  try {
    await auth.logout()
    router.replace('/login')
  } finally {
    loading.value = false
  }
}
</script>
