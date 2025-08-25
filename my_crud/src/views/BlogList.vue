<template>
  <div>
    <Navbar />  
  <div class="bg-gray-50 p-6"> 
    <!-- Header -->
    <div class="max-w-9/10 mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">บทความ</h1>
          </div>

          <!-- router link -->
          <router-link
            to="/blogs/create"
            class="bg-blue-600 hover:bg-blue-700 text-lg text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md flex items-center"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            เพิ่มบทความ
          </router-link>
        </div>

        <!-- Loading State -->
        <div class="flex items-cente">
          <div v-if="blogStore.loading">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 max-auto"
            ></div>
          </div>
        </div>

        <!-- Search and Filer -->
        <SearchBar />
        <div class="p-6 mb-6">
          <!-- Filter Checkbox -->
          <div class="flex items-center">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="showPublishedOnly"
                @change="handleFilterChange"
                class="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-lg text-gray-700">แสดงบทความทั้งหมด</span>
            </label>
          </div>
        </div>

        <!-- Blog List -->
        <div class="space-y-4">
          <BlogCard
            v-for="blog in blogStore.filteredBlogs"
            :key="blog.id"
            :blog="blog"
            @update="handleUpdateBlog"
            @delete="handleDeleteBlog"
            @toggle="handleToggleBlog"
          />
        </div>

        <!-- Empty State -->
        <div v-if="blogStore.loading" class="text-center py-12">
          <svg
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="text-gray-600 text-lg">ไม่พบบทความ</p>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useBlogStore } from "../stores/BlogStore";
import BlogCard from "../components/BlogCard.vue";
import SearchBar from "../components/SearchBar.vue";
import Navbar from "../components/Navbar.vue";

const router = useRouter();
const blogStore = useBlogStore();
const showPublishedOnly = ref(false);

onMounted(() => {
  blogStore.fetchBlogs();
});

const handleUpdateBlog = (blogId: number) => {
  router.push(`/blogs/${blogId}/update`);
};

const handleDeleteBlog = async (blogId: number) => {
  if (confirm("Confirm to Delete ?")) {
    await blogStore.deleteBlog(blogId);
  }
};

const handleToggleBlog = async (bolgId: number, published: boolean) => {
  await blogStore.updateBlog(bolgId, { published });
};

const handleFilterChange = () => {
  blogStore.showPublishedOnly = showPublishedOnly.value;
};

watch(
  () => blogStore.showPublishedOnly,
  (newValue) => {
    showPublishedOnly.value = newValue;
  }
);
</script>