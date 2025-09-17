<template>
  <div class="min-h-[80vh] flex items-center justify-center bg-gray-50">
    <div class="w-[min(92vw,420px)] rounded-2xl bg-white shadow-lg">
      
      <div class="px-6 pt-6 pb-4 ">
        <h1 class="text-center text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
      </div>

      <!-- Form -->
      <form class="p-6 space-y-4" @submit.prevent="onSubmit">
        <!-- Username -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">ผู้ใช้งาน</label>
          <input
            v-model.trim="username"
            type="text"
            required
            autocomplete="username"
            :disabled="loading"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">รหัสผ่าน</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              :disabled="loading"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <!-- ปิด-เปิดดู password -->
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/>
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m3.34-3.34A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.02 10.02 0 01-4.133 5.412M15 12a3 3 0 10-6 0 3 3 0 006 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Error -->
        <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ error }}
        </p>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full rounded-lg bg-green-500 px-4 py-2.5 font-semibold text-white hover:bg-green-600 disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';

const props = defineProps<{
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: { username: string; password: string }): void;
}>();

const username = ref('');
const password = ref('');
const showPassword = ref(false);

const loading = computed(() => !!props.loading);
const error = computed(() => props.error ?? null);

function onSubmit() {
  emit('submit', { username: username.value, password: password.value });
}
</script>
