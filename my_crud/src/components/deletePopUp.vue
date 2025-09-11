<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex items-center justify-center z-50"
    aria-modal="true"
    role="dialog"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="onCancel" />
  <!-- Card -->
    <div
      class="relative w-[min(92vw,380px)] rounded-2xl bg-white p-6 shadow-xl"
    >
      <!-- Icon -->
      <div
        class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10 text-red-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1.077l-1.09 12.04A3 3 0 0 1 14.84 22H9.16a3 3 0 0 1-2.993-2.96L5.077 7H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm2 0v1h2V3h-2ZM7.077 7l1.06 11.72A1 1 0 0 0 9.16 20h5.68a1 1 0 0 0 1.022-.98L16.923 7H7.077ZM10 9a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h2 class="text-center text-xl font-bold text-red-600">ลบข้อมูล</h2>

      <!-- Message -->
      <p class="mt-2 text-center text-gray-600">
        ยืนยันการลบ
        <span class="font-semibold text-gray-900">{{ itemName }}</span>
      </p>

      <!-- Error (optional) -->
      <p
        v-if="error"
        class="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
      >
        {{ error }}
      </p>

      <!-- Actions -->
      <div class="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          @click="onCancel"
          :disabled="loading"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2.5 font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          @click="onConfirm"
          :disabled="loading"
        >
          ลบ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  modelValue: boolean;
  itemName: string;
  error?: string | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

onMounted(() => {
  window.addEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
});

function onCancel() {
  if (props.loading) return;
  emit("update:modelValue", false);
  emit("cancel");
}

function onConfirm() {
  emit("confirm");
}

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape" && props.modelValue && !props.loading) {
    onCancel();
  }
}

</script>