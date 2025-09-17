<template>
<LoginCard
  :loading="loading"
  :error="error"
  @submit="handleLogin" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/AuthStore';
import { useRouter, useRoute } from 'vue-router';
import LoginCard from '../components/LoginCard.vue';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const loading = computed(() => auth.loading);
const error = computed(() => auth.error);

async function handleLogin(payload: { username: string; password: string }) {
  try {
    await auth.login(payload.username, payload.password);
  
    const redirectTo = (route.query.redirect as string) || '/blogs';
    router.push(redirectTo);
  } catch (e) {
   
  }
}

</script>