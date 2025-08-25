<template>
<div>
   <Navbar :breadcrumbs ="['เพิ่มบทความ']" class="text-3xl font-semibold"/>
   <BlogForm />
</div>
</template>
<script setup lang="ts">
import Navbar from "../components/Navbar.vue";
import BlogForm from "../components/BlogForm.vue";
</script>