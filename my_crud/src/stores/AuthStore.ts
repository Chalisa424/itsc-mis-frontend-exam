import { defineStore } from 'pinia';
import http from '../services/apiClient';
import { setAccessToken, setRefreshToken, clearTokens, getAccessToken, isAccessTokenExpired} from '../services/tokenService';

type User = { username: string } | null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const res = await http.post(
          '/auth/login',
          { username, password },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const { access_token, refresh_token, expires_in } = res.data || {}
        if (!access_token || !refresh_token) {
          throw new Error('Invalid login response')
        }

        setAccessToken(access_token, expires_in ?? 300)
        setRefreshToken(refresh_token)

        // ดึงข้อมูลผู้ใช้
        const me = await http.get('/auth/me')
        this.user = { username: me.data?.username ?? username }
      } catch (e: any) {
        this.error =
          e?.response?.data?.error ??
          (e?.message || 'Invalid username or password.')
        clearTokens()
        this.user = null
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      this.loading = true
      this.error = null
      try {
        const res = await http.get('/auth/me')
        this.user = { username: res.data?.username }
        return res.data
      } catch (e) {
        this.user = null
        throw e
      } finally {
        this.loading = false
      }
    },

    async restore() {
      const token = getAccessToken()
      if (!token || isAccessTokenExpired()) {
        clearTokens()
        this.user = null
        return
      }
      try {
        await this.fetchMe()
      } catch {
        this.user = null
      }
    },

    async logout() {
      this.loading = true
      this.error = null
      try {
        await http.delete('/auth/logout')
      } catch {
      } finally {
        clearTokens()
        this.user = null
        this.loading = false
      }
    },
  },
})