<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/AuthStore'
import { useRouter } from 'vue-router'
const auth = useAuthStore()
const router = useRouter()
onMounted(async () => {
  await auth.logout()
  router.replace('/login')
})
</script>