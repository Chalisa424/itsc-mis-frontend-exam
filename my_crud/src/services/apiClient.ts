import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from './tokenService';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://exam-api.dev.mis.cmu.ac.th/api';

const http = axios.create({
  baseURL: API_BASE_URL
});

let isRefreshing = false; //ขอ token ใหม่อยู่หรือไม่
let subscribers: Array<(token: string) => void> = [];//arrayเก็บfunctionที่รอtokenใหม่ — เมื่อrefreshเสร็จจะเรียกfunctionทั้งหมด

function subscribeTokenRefresh(cb: (token: string) => void) {//function cb ที่ส่งมาถูกเก็บไว้ใน subscribers
  subscribers.push(cb); //เมื่อtokenใหม่ได้มาแล้ว จะเรียก cb(newToken)
}
function onRefreshed(token: string) {//ได้tokenใหม่แล้ว  เรียกfunctionทั้งหมดใน subscribers ด้วยtokenใหม่
  subscribers.forEach((cb) => cb(token));
  subscribers = []; //ล้าง array หลังจากเรียกทั้งหมดแล้ว
}
//------------- token ที่ถูกต้อง--------------------
http.interceptors.request.use((config) => {
  const token = getAccessToken() //ใช้ token service ดึง access token ที่เก็บไว้
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};//บันทึก config ของ request ที่เกิด error เพื่อใช้ส่งใหม่หลัง refresh
    const status = error?.response?.status; //รหัสสถานะ HTTP (เช่น 401)
    const url: string = original?.url || '';//ตรวจสอบว่า request นี้คือ endpoint ไหน ป้องกัน infinite loop

    // กัน loop ไม่ refresh บน /auth/login และ /auth/refresh เอง
    const isAuthPath = url.includes('/auth/login') || url.includes('/auth/refresh');//โทเค็นหมดอายุหรือไม่ถูกต้อง

    if (status === 401 && !original.__isRetry && !isAuthPath) {
      original.__isRetry = true;

      const rt = getRefreshToken();
      if (!rt) {
        clearTokens();
        return Promise.reject(error);
      }

      // ถ้ากำลังรีเฟรชอยู่ให้รอ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) return reject(error);
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: rt,
        });
        const newToken: string = resp.data?.access_token;
        const expiresIn: number = resp.data?.expires_in ?? 300;

        setAccessToken(newToken, expiresIn);
        http.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        
        isRefreshing = false;
        onRefreshed(newToken);

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        isRefreshing = false;
        onRefreshed(''); 
        clearTokens();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default http;
