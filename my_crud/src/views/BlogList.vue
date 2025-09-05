<template>
  <div>
    <Navbar />
    <div class="bg-gray-50 p-6">
      <!-- Header -->
      <div class="max-w-3/4 mx-auto">
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between mb-8">
            <!-- กลุ่มซ้าย -->
            <div class="flex items-center gap-4">
              <h1 class="text-3xl font-bold text-gray-900 mb-2 p-5">บทความ</h1>

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

            <!-- กลุ่มขวา Toggle แสดงทั้งหมด -->
            <ToggleSwitch v-model="showAll" size="md"> แสดงทั้งหมด </ToggleSwitch>
          </div>

          <!-- Loading State -->
          <div
            class="flex items-center justify-center"
            v-if="blogStore.loading"
          >
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 max-auto"
            ></div>
          </div>
          

          <!-- Search and Filer -->
          <SearchBar />

           <!-- หัวข้อ Select multiple-->
           <div class="flex mt-4 border-t border-b border-gray-300 px-3 py-3 flex items-center">
            <input 
              type="checkbox"
              :checked="allSelected"
              @change ="toggleSelectAll(($event.target as HTMLInputElement).checked)"
              class="w-6 h-6 text-lue-600 bg-gray-100 border-gray-300 rounded"
              />
              <span class="flex-1 px-50 ml-3 font-semibold text-2xl text-gray-700">หัวข้อ</span>
           </div>

          <!-- Blog List -->
          <div class="space-y-4 py-5">
            <BlogCard
              v-for="blog in pagedBlogs"
              :key="blog.id"
              :blog="blog"
            />
          </div>

          <!-- footer -->
          <div
            class="mt-6 flex items-center justify-between tex-lg text-gray-700"
          >
            <div>แสดง {{ pagedBlogs.length }} รายการ
              <span v-if="selectedIds.size">• เลือก {{ selectedIds.size }} รายการ</span>
            </div>
            <div class="flex items-center gap-2">
              <span>จำนวนต่อหน้า</span>
              <select
                v-model="pageSize"
                @change="page = 1"
                class="border border-gray-300 rounded-lg px-3 py-2 bq-white"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
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
import ToggleSwitch from "../components/ToggleSwitch.vue";

const router = useRouter();
const blogStore = useBlogStore();

// Local UI state
const searchQuery = ref("");
const showAll = ref<boolean>(true); //// กรองให้ถูกทิศ: เปิด (true) = แสดงทั้งหมด, ปิด (false) = เฉพาะเผยแพร่

// multiple select state
const selectedIds = ref<Set<number>>(new Set());

// การโหลดข้อมูล
onMounted(async () => {
  // ถ้าต้องการให้ server กรองเลย ให้ส่ง q/show เข้าไป
  // await blogStore.fetchBlogs({ q: searchQuery.value || undefined, show: showAll.value ? "all" : "active" });
  await blogStore.fetchBlogs();
});

// ----- Search
const filteredBlogs = computed(() => {
  let list = blogStore.blogs ?? []
  const q = searchQuery.value.trim().toLowerCase();
  // ค้นหาจาก title+content
  if (q) {
    list = list.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q)
    );
  }
  //Toggle แสดงบทความทั้งหมด เปิดสวิตช์ = แสดงทั้งหมด (ไม่กรอง) | ปิดสวิตช์ = เฉพาะเผยแพร่ (ค่อยกรอง)
  if (!showAll.value){
    list = list.filter((b) => b.published);
  }
  return list;
});

//---------------- Multiple Select----------------
const allSelected = computed(() => {
  if(!pagedBlogs.value.length)return false;
  return pagedBlogs.value.every((b) => selectedIds.value.has(b.id))
})

function toggleSelectAll(checked: boolean) {
  if (checked) {
    pagedBlogs.value.forEach((b) => selectedIds.value.add(b.id));
  } else {
    pagedBlogs.value.forEach((b) => selectedIds.value.delete(b.id));
  }
}

function toggleSelectOne(id: number, checked: boolean) {
  if (checked) selectedIds.value.add(id);
  else selectedIds.value.delete(id);
}

// -------------------Pagination------------------- 
const page = ref<number>(1);
const pageSize = ref<number>(10);

watch([filteredBlogs, pageSize], () => {
  page.value = 1;
}); //// พอผลลัพธ์เปลี่ยนหรือ pageSize เปลี่ยน ให้รีเซ็ตไปหน้าแรก

const pagedBlogs = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBlogs.value.slice(start, end);
});

// --------------- Handlers -----------------------
//Event handlers (เชื่อม UI => Store)
const handleUpdateBlog = (blogId: number) => {
  router.push(`/blogs/${blogId}/update`);
};

const handleDeleteBlog = async (blogId: number) => {
  if (confirm("Confirm to Delete ?")) {
    await blogStore.deleteBlog(blogId);
    selectedIds.value.delete(blogId);
  }
};

const handleToggleBlog = async (blogId: number, data: any) => {
  try {
    await blogStore.updateBlog(blogId, data); ///get data ทั้งหมด
  } catch (e) {
    console.error("toggle failed", e);
  }
};
</script>
