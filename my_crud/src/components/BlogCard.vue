<template>
  <div
    class="flex border boder-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadaow overflow-hidden"
  >
    <!-- Image -->
    <div v-if="localPublished" class="w-1/4 min-w-[120px] max-w-[200px]">
      <div v-if="localPublished && showImage" class="w-full h-full">
        <img
          :src="imgSrc"
          @error="onImageError"
          class="w-full h-full object-cover"
          alt="blog cover"
        />
      </div>
      <div
        v-else
        class="w-full h-full bg-gray-100 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-12 h-12 text-gray-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
          />
        </svg>
      </div>
    </div>

    <div class="flex-1 p-4 flex flex-col">
      <div class="flex items-start justify-between mb-3">
        <!-- Title -->
        <router-link
          v-if="localPublished"
          class="text-xl font-semibold text-gray-600 line-clamp-2 ml-4 flex-1 text-left hover:underline"
          :to="`/blogs/${blog.id}`"
        >
          {{ blog.title }}
        </router-link>

        <!-- สถานะ -->
        <div class="flex items-center">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="localPublished"
              class="sr-only peer"
              :disabled="busy"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"
            ></div>
            <span class="ml-2 text-sm font-medium text-gray-900">
              {{ localPublished ? "เผยแพร่" : "ซ่อน" }}
            </span>
          </label>
        </div>
      </div>


      <!-- Footer: Date and Buttons -->
      <div class="flex items-center justify-between pt-15">
        <!-- Date -->
        <div
          v-if="localPublished"
          class="flex px-4 items-center text-gray-500 text-lg"
        >
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
          {{ formatDate(blog.createdAt) }}
        </div>

        <!-- แสดงสถานะ "ซ่อนอยู่" เมื่อบทความถูกซ่อน -->
        <div v-else class="flex items-center text-gray-500 text-lg">
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
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
          บทความถูกซ่อนอยู่
        </div>

        <!-- ปุ่ม Edit & Delete -->
        <div class="flex justify-end space-x-3">
          <!-- Edit Button -->
          <button
            @click="handleUpdate"
            :disabled="busy"
            class="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            title="แก้ไข"
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
            :disabled="busy"
            class="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            title="ลบ"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

</template>


<script setup lang="ts">
import { computed, watch, ref } from "vue";
import type { Blog } from "../types/blog";
import { useRouter } from "vue-router";
import { useBlogStore } from "../stores/BlogStore";
import dayjs from "dayjs";

interface Props {
  blog: Blog;
}
const props = defineProps<Props>();

const router = useRouter();
const blogStore = useBlogStore();

const PLACHOLDER = "/placeholder-image.jpg";
const imgSrc = ref(props.blog.imageUrl || PLACHOLDER);
const showImage = computed(() => !!imgSrc.value && imgSrc.value !== PLACHOLDER);
const busy = ref(false)
//sync รูป
watch(
  () => props.blog.imageUrl,
  (v) => {
    imgSrc.value = v || PLACHOLDER;
  }
);

//รูปพัง
const onImageError = () => {
  imgSrc.value = PLACHOLDER;
};

//สถานะเผยแพร่
const localPublished = ref<boolean>(props.blog.published ?? false);

watch(
  () => props.blog.published,
  (v) => {
    localPublished.value = v ?? false;
  }
);

// เมื่อสวิตช์เปลี่ยน → call store.updateBlog แบบ toggle-only
watch(localPublished, async(newValue, oldValue) => {
  if (newValue === oldValue) return;
  try {
    busy.value = true;
    await blogStore.updateBlog(props.blog.id, { published: newValue });
    // store.updateBlog จะอัปเดต cache ให้เองอยู่แล้ว
  } catch (e) {
    console.error("toggle failed", e);
    // rollback UI ถ้าพัง
    localPublished.value = oldValue ?? false;
    alert("อัปเดตสถานะไม่สำเร็จ");
  } finally {
    busy.value = false;
  }
});


//  Function จัดรูปแบบวันที่
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('D MMM YYYY')
};

//  Function ไปหน้า edit
const handleUpdate = () => {
  router.push(`/blogs/${props.blog.id}/update`);
};

//  Function จัดการ delete
const handleDelete = async () => {
  if (!confirm("Confirm to Delete ?")) return;
  try {
    busy.value = true;
    await blogStore.deleteBlog(props.blog.id);
  } catch (e) {
    console.error("delete failed", e);
    alert("ลบไม่สำเร็จ");
  } finally {
    busy.value = false;
  }
};



</script>

