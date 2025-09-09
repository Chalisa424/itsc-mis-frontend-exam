<template>
  <div>
    <Navbar :breadcrumbs="['เพิ่มบทความ']" class="text-3xl font-semibold" />

    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-9/10 mx-auto">
        <BlogForm
          :disabled="submitting"
          submit-text="บันทึก"
          @submit="onSubmit"
          @cancel="onCancel"
        >
          <template #title>เพิ่มบทความ</template>
        </BlogForm>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar.vue";
import BlogForm from "../components/BlogForm.vue";
import { useBlogStore } from "../stores/BlogStore";

type SumitPayload = {
  title: string;
  content: string;
  image: File | null;
  published: boolean;
};

const router = useRouter();
const store = useBlogStore();
const submitting = ref(false);

const onCancel = () => {
  router.push("/blogs");
};

const onSubmit = async (payload: SumitPayload) => {
  submitting.value = true;
  try {
    await store.addBlog({
      title: payload.title,
      content: payload.content,
      image: payload.image,
      published: payload.published,
    })
    router.push("/blogs");
  } catch (e) {
    console.error("Failed to create blog", e);
    alert("เกิดข้อผิดพลาดในการบันทึก");
  } finally {
    submitting.value = false;
  }
};
</script>