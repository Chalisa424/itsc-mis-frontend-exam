<template>
  <div>
    <Navbar :breadcrumbs="crumbs" class="text-3xl"/>

    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-9/10 mx-auto">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <!-- Loading -->
          <div v-if="loading" class="animate-pulse space-y-4">
            <div class="h-8 w-2/3 bg-gray-200 rounded"></div>
            <div class="h-4 w-1/3 bg-gray-200 rounded"></div>
            <div class="h-64 w-full bg-gray-200 rounded"></div>
            <div class="h-4 w-full bg-gray-200 rounded"></div>
            <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="handleSubmit" novalidate>
            <h1 class="text-2xl font-bold text-gray-900 mb-6">แก้ไขบทความ</h1>

            <!-- Title -->
            <div class="mb-6">
              <label for="title" class="block text-lg font-semibold mb-2">
                <span class="text-red-600">*</span> หัวข้อ
              </label>
              <input
                id="title"
                type="text"
                v-model.trim="form.title"
                autocomplete="off"
                class="block w-full p-4 border rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-400': errors.title }"
                placeholder="ใส่หัวข้อบทความ"
              />
              <p v-if="errors.title" class="mt-1 text-sm text-red-600">
                {{ errors.title }}
              </p>
            </div>

            <!-- Content -->
            <div class="mb-6">
              <label for="content" class="block text-lg font-semibold mb-2">
                <span class="text-red-600">*</span> เนื้อหา
              </label>
              <textarea
                id="content"
                v-model.trim="form.content"
                rows="10"
                class="block w-full p-4 border rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-400': errors.content }"
                placeholder="ใส่เนื้อหาบทความ"
              />
              <p v-if="errors.content" class="mt-1 text-sm text-red-600">
                {{ errors.content }}
              </p>
            </div>

            <!-- Image -->
            <div class="mb-6">
              <label class="block text-lg font-semibold mb-2">รูปภาพ</label>

              <!-- Upload box centered horizontally -->
              <div
                class="w-full flex items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100 cursor-pointer text-center"
                @click="onPick"
                role="button"
                tabindex="0"
                @keydown.enter.prevent="onPick"
                @keydown.space.prevent="onPick"
              >
                <svg
                  class="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                <div>
                  <p class="text-gray-700">
                    <span class="text-blue-600 font-medium"
                      >คลิกเพื่ออัปโหลด</span
                    >
                    หรือ ลากและวางไฟล์ที่นี่ (PNG, JPG, GIF สูงสุด 10MB)
                  </p>
                </div>

                <input
                  id="image-upload"
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
              </div>

              <!-- Image error -->
              <p v-if="errors.image" class="mt-2 text-sm text-red-600">
                {{ errors.image }}
              </p>

              <!-- Preview Image -->
              <div v-if="imagePreview" class="mt-4">
                <div class="relative inline-block">
                  <img
                    :src="imagePreview"
                    alt="Preview"
                    class="w-48 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    @click="removeImage"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex justify-end gap-3">
              <button
                type="button"
                @click="goBack"
                class="px-5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                 class="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
               บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import { useBlogStore } from "../stores/BlogStore";
import type { Blog } from "../types/blog";

const route = useRoute();
const router = useRouter();
const store = useBlogStore();
const id = Number(route.params.id);

const loading = ref(true);
const submitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const blog = computed<Blog | undefined>(() =>
  store.blogs.find((b) => b.id === id)
);

// form state ใช้โครงสร้างคล้ายกับ ฺBlog ที่ไม่ได้มีทุก field
const form = reactive({
  title: "",
  content: "",
});
const newImageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);

interface FromError{
  title?: string;
  content?: string;
  image?: string;
}

const errors = reactive<FromError>({});

const crumbs = computed(() => [
  blog.value?.title || "รายละเอียดบทความ",
  "แก้ไขบทความ",
]);

// --- validation ---
const isValid = computed(() =>{
  return !errors.title && !errors.content
})

function validateForm(): boolean {
  let valid = true;
  
  if (!form.title.trim()) {
    errors.title = "กรุณากรอกหัวข้อบทความ";
    valid = false;
  } else {
    errors.title = "";
  }
  
  if (!form.content.trim()) {
    errors.content = "กรุณากรอกเนื้อหาบทความ";
    valid = false;
  } else {
    errors.content = "";
  }
  
  return valid;
}

//Navigation
function goBack():void{
  router.push("/blogs");
}

// Image handlers
function onPick() {
  fileInput.value && fileInput.value.click();
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) processImage(file);
}

function processImage(file: File) {
  // validate
  if (file.size > 10 * 1024 * 1024) {
    errors.image = "ไฟล์ต้องมีขนาดไม่เกิน 10MB";
    return;
  }
  if (!file.type.startsWith("image/")) {
    errors.image = "กรุณาเลือกไฟล์รูปภาพเท่านั้น";
    return;
  }
  errors.image = "";
  newImageFile.value = file;

  if (imagePreview.value?.startsWith("blob:"))
    URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = URL.createObjectURL(file);
}

function removeImage():void {
  if (imagePreview.value?.startsWith("blob:"))
    URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = null;
  newImageFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
}

// Form submission ใช้ parameter format ตามที่ store กำหนด
async function handleSubmit(): Promise<void> {
  if (!validateForm() ||!blog.value) return;
  submitting.value = true;
  try {
  // ส่ง parameter ตามที่ store updateBlog ต้องการ
    await store.updateBlog(blog.value.id, {
      title: form.title,
      content: form.content,
      image: newImageFile.value,
      published: blog.value.published
    });
    router.push("/blogs");
  } catch (e: any) {
    console.error("Update failed", e);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    if (!blog.value) await store.fetchBlogById(id);
    if (blog.value) {
      form.title = blog.value.title;
      form.content = blog.value.content;
      // ถ้ามีรูปจากเซิร์ฟเวอร์โชว์เป็น preview เริ่มต้น
    }
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (imagePreview.value?.startsWith("blob:"))
    URL.revokeObjectURL(imagePreview.value);
});

</script>
