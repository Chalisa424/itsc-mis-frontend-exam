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
            <ToggleSwitch v-model="showAll" size="md">
              แสดงทั้งหมด
            </ToggleSwitch>
          </div>

          <!-- Loading State -->
          <div class="flex items-center justify-center" v-if="showSpinner">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
            ></div>
          </div>
          <!-- Search and Filer -->
          <SearchBar />

          <!-- หัวข้อเลือกทั้งหมด Select multiple-->
          <div
            class="flex mt-4 border-t border-b border-gray-300 px-4 py-3 flex items-center"
          >
            <input
              ref="selectAllRef"
              type="checkbox"
              :checked="allSelected"
              @change="
                toggleSelectAll(($event.target as HTMLInputElement).checked)
              "
              class="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded"
            />
            <span class="flex-1 px-50 ml-3 font-semibold text-2xl text-gray-700"
              >หัวข้อ</span>
          </div>
          <div class="space-y-4 py-5">
            <BlogCard
              v-for="blog in pagedBlogs"
              :key="blog.id"
              :blog="blog"
              :selected="selectedIds.has(blog.id)"
              @update:selected="(v) => toggleSelectOne(blog.id, v)"
              @request-delete="onRequestDelete"
            />
          </div>
          <!-- footer -->
          <div
            class="mt-6 flex items-center justify-between tex-lg text-gray-700"
          >
            <div>
              แสดง {{ pagedBlogs.length }} รายการ
              <span v-if="selectedIds.size"
                >• เลือก {{ selectedIds.size }} รายการ</span
              >
            </div>
            <div class="flex items-center gap-2">
              <span>จำนวนต่อหน้า</span>
              <select
                v-model="pageSize"
                @change="page = 1"
                :disabled="showAll"
                class="border border-gray-300 rounded-lg px-3 py-2 bq-white"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="30">30</option>
                <option :value="40">40</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useBlogStore } from "../stores/BlogStore";
import BlogCard from "../components/BlogCard.vue";
import SearchBar from "../components/SearchBar.vue";
import Navbar from "../components/Navbar.vue";
import ToggleSwitch from "../components/ToggleSwitch.vue";
import type { Blog } from "../types/blog";

const {
  blogs, // ref<Blog[]>
  blog, // ref<Blog|null>
  loading, // ref<boolean>
  error, // ref<string|null>
  searchQuery, // ref<string>
  fetchBlogs,
  deleteBlog,
  deleteMany,
} = useBlogStore();

const FORCE_MIN_MS = 1500;
const showSpinner = ref(false);
let startAt = 0;
let spinerTimer: number | null = null;

const showAll = ref<boolean>(true);
watch(showAll, () => {
  page.value = 1;
});

const showInitialSpinner = computed(
  () => showSpinner.value && !blogs.value.length
);

// multiple select state
const selectedIds = ref<Set<number>>(new Set());

//Loading
watch(loading, (is) => {
  if (is) {
    if (spinerTimer) {
      clearTimeout(spinerTimer);
      spinerTimer = null;
    }
    showSpinner.value = true;
    startAt = performance.now();
  } else {
    const elapsed = performance.now() - startAt;
    const wait = Math.max(0, FORCE_MIN_MS - elapsed);
    spinerTimer = window.setTimeout(() => {
      showSpinner.value = false;
      spinerTimer = null;
    }, wait);
  }
});

// การโหลดข้อมูล
onMounted(async () => {
  try {
    await fetchBlogs();
  } catch (e) {
    console.error(e);
  }
});

onUnmounted(() => {
  if (spinerTimer) clearTimeout(spinerTimer);
});

// ----- -------------------------------Search---------------------------------------------
const filteredBlogs = computed(() => {
  let list = blogs.value ?? [];
  const q = (searchQuery.value ?? "").trim().toLowerCase();
  // ค้นหาจาก title+content
  if (q) {
    list = list.filter(
      (b: Blog) =>
        b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)
    );
  }

  return list;
});

// -------------------Pagination-------------------
const page = ref<number>(1);
const pageSize = ref<number>(10);

watch(showAll, () => {
  page.value = 1;
});
watch([filteredBlogs, pageSize], () => {
  page.value = 1;
});

//รายการตามหน้า
const pagedBlogs = computed(() => {
  if (showAll.value) return filteredBlogs.value;
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBlogs.value.slice(start, end);
});

//จำนวนที่เลือก
const selectedOnPageCount = computed(
  () => pagedBlogs.value.filter((b: Blog) => selectedIds.value.has(b.id)).length
);

//---------------- Multiple Select----------------

// true ถ้าเลือกครบทุกใบในหน้าและหน้าไม่ว่าง
const allSelected = computed(
  () =>
    pagedBlogs.value.length > 0 &&
    selectedOnPageCount.value === pagedBlogs.value.length
);

// indeterminate ของ master checkbox
const selectAllRef = ref<HTMLInputElement | null>(null);
watch([allSelected, selectedOnPageCount, pagedBlogs], () => {
  if (!selectAllRef.value) return;
  selectAllRef.value.indeterminate =
    selectedOnPageCount.value > 0 && !allSelected.value;
});

// เลือก/ไม่เลือกทั้งหมด
function toggleSelectAll(checked: boolean) {
  if (checked) {
    pagedBlogs.value.forEach((b: Blog) => selectedIds.value.add(b.id));
  } else {
    pagedBlogs.value.forEach((b: Blog) => selectedIds.value.delete(b.id));
  }
}

// เลือก/ไม่เลือกรายการเดียว
function toggleSelectOne(id: number, checked: boolean) {
  if (checked) selectedIds.value.add(id);
  else selectedIds.value.delete(id);
}

// ------------------------------ฟังก์ชันลบ (เดี่ยว/หลาย) ------------------------------
async function onRequestDelete(targetId: number) {
  const hasSelection = selectedIds.value.size > 0;
  const ids = hasSelection ? Array.from(selectedIds.value) : [targetId];

  if (ids.length > 1) {
    await deleteMany(ids);
    selectedIds.value.clear();
  } else {
    await deleteBlog(targetId);
    selectedIds.value.delete(targetId);
  }
}

watch(
  () => blogs.value.map((b: Blog) => b.id),
  (ids) => {
    const alive = new Set(ids);
    for (const id of Array.from(selectedIds.value)) {
      if (!alive.has(id)) selectedIds.value.delete(id);
    }
  },
  { immediate: true }
);
</script>
