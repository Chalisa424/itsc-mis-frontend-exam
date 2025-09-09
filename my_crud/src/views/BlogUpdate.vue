<template>
  <div>
    <Navbar :breadcrumbs="crumbs" class="text-3xl" />

    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-9/10 mx-auto">
        <!-- Loading -->
        <div v-if="loading" class="animate-pulse space-y-4">
          <div class="h-8 w-2/3 bg-gray-200 rounded"></div>
          <div class="h-4 w-1/3 bg-gray-200 rounded"></div>
          <div class="h-64 w-full bg-gray-200 rounded"></div>
          <div class="h-4 w-full bg-gray-200 rounded"></div>
          <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>

        <!-- Form -->
        <BlogForm
          v-else
          :initial="{
            title: blog?.title,
            content: blog?.content,
            imageUrl: blog?.imageUrl ?? null,
            published: blog?.published ?? false,
          }"
          :disabled="submitting"
          submitt-text="บันทึก"
          @submit="onSubmit"
          @cancel="onCancel"
        >
      <template #title>แก้ไขบทความ</template>
      </BlogForm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onBeforeUnmount,reactive,ref,watch,} from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import BlogForm from "../components/BlogForm.vue";
import { useBlogStore } from "../stores/BlogStore";
import type { Blog } from "../types/blog";

const route = useRoute();
const router = useRouter();
const store = useBlogStore();
const id = Number(route.params.id);

const loading = ref(true);
const submitting = ref(false);

const blog = computed<Blog | undefined>(() =>
  store.blogs.find((b) => b.id === id)
);

const crumbs = computed(() => [
  blog.value?.title || "รายละเอียดบทความ",
  "แก้ไขบทความ",
]);

const ensureBlogLoaded = async () => {
  if (!blog.value) {
    try {
      await store.fetchBlogById(id);
    } catch (e) {
      console.error("ไม่พบบทความที่ต้องการแก้ไข");
    }
  }
};

//Navigation
const onCancel = () => {
  router.push("/blogs");
};

const onSubmit = async (payload: {
  title: string;
  content: string;
  image: File | null;
  published: boolean;
}) => {
  if (!blog.value) return;

  submitting.value = true;
  try {
    await store.updateBlog(blog.value.id, {
      title: payload.title,
      content: payload.content,
      image: payload.image,
      published: payload.published,
    });
    router.push("/blogs");
  } catch (e) {
    console.error("Update failed", e);
    alert("อัปเดตไม่สำเร็จ");
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    await ensureBlogLoaded();
  } finally {
    loading.value = false;
  }
});
</script>
