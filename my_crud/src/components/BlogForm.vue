<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9/10 mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">เพิ่มบทความ</h1>

        <form @submit.prevent ="handleSubmit">
          <!-- หัวข้อ -->
          <div class="mb-6 py-8">
            <label class="block text-xl font-semibold text-gray-900 mb-3"
              ><span class="text-red-600">*</span>หัวข้อ</label>
            <input
              id="title"
              name="title"
              type="text"
              v-model="formData.title"
              required
              autocomplete="off"
              class="block w-full p-5 ps-20 border border-gray-300 rounded-2xl bg-gray-50"
            />
          </div>
          <!-- เนื้อหา -->
          <div class="mb-6">
            <label class="block text-xl font-semibold text-gray-900 mb-3">
              <span class="text-red-600">*</span> เนื้อหา
            </label>
            <textarea
              id="content"
              name="content"
              v-model="formData.content"
              required
              rows="8"
              autocomplete="off"
              class="block w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ใส่เนื้อหาบทความ"
            ></textarea>
          </div>

          <!-- รูปภาพ -->
          <div class="mb-6">
            <label class="block text-xl font-semibold text-gray-900 mb-3">
              รูปภาพ
            </label>

            <!-- Drag & Drop Area -->
            <div
              @click="triggerFileInput"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              :class="[
                'border-2  border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-colors',
                'bg-gray-50 px-6 py-4',
                'flex items-center justify-center text-gray-600',
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                 
              ]"
            >
            
            <div class="inline-flex items-center gap-1">
            <svg
                class="w-12 h-12 text-gray-400 mx-auto mb-4"
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

              <p class="text-gray-600 text-lg mb-2">
                <span class="text-blue-600 font-medium">คลิกเพื่ออัปโหลด</span>
                หรือลากและวางไฟล์ที่นี่ PNG, JPG, GIF up to 10MB
              </p>
              

              <input
                id="image-upload"
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="hidden"
              />
            </div>
            </div>
           
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

            <!-- Selected file name -->
            <div v-if="formData.image" class="mt-2 text-sm text-gray-600">
              ไฟล์: {{ formData.image.name }}
            </div>
          </div>

        

          <!-- ปุ่มดำเนินการ -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="$router.back()"
              class="px-6 py-3 border border-gray-300 rounded-lg text-white bg-red-500 hover:bg-red-600"
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
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useBlogStore } from "../stores/BlogStore";

const router = useRouter();
const blogStore = useBlogStore()
const fileInput = ref<HTMLInputElement | null>(null);
const dragActive = ref(false);
const isSubmitting =ref(false)

const formData = reactive({
  title: "",
  content: "",
  image: null as File | null,
  published: false,
});

const imagePreview = ref<string | null>(null);

// เปิด file dialog
const triggerFileInput = () => {
  fileInput.value?.click();
};

// จัดการเมื่อเลือกไฟล์
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    processImage(input.files[0]);
  }
};

// Drag and drop handlers
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = () => {
  dragActive.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragActive.value = false;

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processImage(event.dataTransfer.files[0]);
  }
};

//ลบlink preview 
onBeforeMount(() => {
  if(imagePreview.value && imagePreview.value.startsWith('blob:')){
    URL.revokeObjectURL(imagePreview.value)
  }
})

// Process image and create preview
const processImage = (file: File) => {
  // ตรวจสอบขนาดไฟล์ (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert("ไฟล์ต้องมีขนาดไม่เกิน 10MB");
    return;
  }

  // ตรวจสอบประเภทไฟล์
  if (!file.type.startsWith("image/")) {
    alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    return;
  }

  formData.image = file;

  // สร้าง preview ด้วย Blob URL
  imagePreview.value = URL.createObjectURL(file);
};

// ลบรูปภาพ
const removeImage = () => {
//ลบlink blob 
  if(imagePreview.value && imagePreview.value.startsWith('blob:')){
    URL.revokeObjectURL(imagePreview.value)
  }
  
  formData.image = null;
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Submit form
const handleSubmit = async () => {
  if (!formData.title || !formData.content) {
    alert("กรุณากรอกหัวข้อและเนื้อหา");
    return;
  }
  

  try {
    //ส่งข้อมูลไป store
    const blogData ={
      title: formData.title,
      content: formData.content,
      image: formData.image,
      published: formData.published
    };
      
    const result = await blogStore.addBlog(blogData)
    console.log('Blog crated', result)

    router.push("/blogs"); 
  } catch (error: any) {
    console.error("เกิดข้อผิดพลาด:", error);
    const errorMessage = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึก";
    alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.drag-active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
</style>