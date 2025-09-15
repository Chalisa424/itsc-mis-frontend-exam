import { defineStore } from 'pinia';
import http from '../services/apiClient';
import { setTokens, setAccessToken, clearTokens, getAccessToken, getRefreshToken, isAccessTokenExpired} from '../services/tokenService';

type User = { username: string } | null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User, // /auth/user เริ่มต้น null
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: () => {
      return !!getAccessToken() && !isAccessTokenExpired();
    },
  },
  actions: {
    async login(username: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await http.post('/auth/login', { username, password });// ส่ง username, password ไปที่ /auth/login
        const { access_token, expires_in, refresh_token } = res.data;
        setTokens(access_token, refresh_token, expires_in ?? 300);
        await this.fetchUser();
      } catch (e: any) {
        this.error = e?.response?.data?.error || 'Login failed';
        clearTokens();
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async fetchUser() { //เรียก API /auth/user เพื่อดึงข้อมูลผู้ใช้ 
      const res = await http.get('/auth/user');
      this.user = res.data; 
      return this.user;
    },
    async refresh() {
      const rt = getRefreshToken();
      if (!rt) throw new Error('No refresh token');
      const res = await http.post('/auth/refresh', { refresh_token: rt });
      const { access_token, expires_in } = res.data;
      setAccessToken(access_token, expires_in ?? 300);
      return access_token;
    },
    async logout() {//ส่ง DELETE request  ผู้ใช้ลงชื่อออก
      try {
        await http.delete('/auth/logout'); 
      } catch (_) {
        
      } finally {
        clearTokens();
        this.user = null;
      }
    },
    async restore() {
      
      try {
        if (getAccessToken() && !isAccessTokenExpired()) {
          await this.fetchUser();
        }
      } catch (_) {
        clearTokens();
        this.user = null;
      }
    },
  },
});
