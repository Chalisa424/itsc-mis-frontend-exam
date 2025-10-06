import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
  isAccessTokenExpired,
} from './tokenService';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://exam-api.dev.mis.cmu.ac.th/api';

const http = axios.create({
  baseURL: API_BASE_URL
});

let isRefreshing = false; //ขอ token ใหม่อยู่หรือไม่
let subscribers: Array<(token: string | null) => void> = [];//arrayเก็บfunctionที่รอtokenใหม่ — เมื่อrefreshเสร็จจะเรียกfunctionทั้งหมด

function subscribeTokenRefresh(cb: (token: string  | null) => void) {//function cb ที่ส่งมาถูกเก็บไว้ใน subscribers
  subscribers.push(cb); //เมื่อtokenใหม่ได้มาแล้ว จะเรียก cb(newToken)
}
function onRefreshed(token: string | null) {//ได้tokenใหม่แล้ว  เรียกfunctionทั้งหมดใน subscribers ด้วยtokenใหม่
  subscribers.forEach((cb) => cb(token));
  subscribers = []; //ล้าง array หลังจากเรียกทั้งหมดแล้ว
}

//------------- แนบ access token ทุกครั้งที่ขอ--------------------
http.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  // ถ้าไม่มี token ก็ปล่อยผ่าน
  if(!token)return config;
 
   // ถ้ายังไม่หมดอายุ ให้แนบแล้วส่งต่อ
  if (!isAccessTokenExpired()) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    return config;
  }
    
  const rt = getRefreshToken();
  if(!rt){
    clearTokens();
    return config
  }

  // ถ้ามีการรีเฟรชอยู่แล้วให้รอก่อน
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        if (!newToken) return reject(new Error('Refresh failed'));
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${newToken}`;
        resolve(config);
      });
    });
  }

  // เริ่มรีเฟรชจริง
  isRefreshing = true;
  try {
    const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: rt,
    });
    const newToken: string = (resp as any).data?.access_token;
    const expiresIn: number = (resp as any).data?.expires_in ?? 300;
    const rtNew: string | undefined = (resp as any).data?.refresh_token;

    if (!newToken) throw new Error('No access_token in refresh response');

    setAccessToken(newToken, expiresIn);
    if(rtNew) setRefreshToken(rtNew); //อัปเดต refresh token
    isRefreshing = false;
    onRefreshed(newToken);

    // แนบโทเค็นใหม่ลงคำขอปัจจุบัน
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${newToken}`;
    return config;
  } catch (e) {
    isRefreshing = false;
    onRefreshed(null); 
    clearTokens();
    return config;
  }
})


//--------- ทำงานเมื่อรับ response จาก server -------------
http.interceptors.response.use(
  (res) => res,
  async (error : AxiosError) => {
    const original = (error.config as (InternalAxiosRequestConfig & {_isRetry?: boolean})) || {};//config คำขอเดิม
    const status = error?.response?.status; //HTTP status code
    const url: string = original?.url || ''; //path กัน loop กัน refresh ซ้อน
    const isAuthPath = url.includes('/auth/login') || url.includes('/auth/refresh');// true ถ้าเป็น path login หรือ refresh

    //กัน loop
    if (status === 401 && !original._isRetry && !isAuthPath) {
      original._isRetry = true;

      const rt = getRefreshToken();
      if (!rt) {
        clearTokens();
        return Promise.reject(error);
      }

      // ถ้ากำลังรีเฟรชอยู่ให้รอ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newtoken) => {
            if (!newtoken) return reject(error);
            original.headers = original.headers ?? {};
            (original.headers as any).Authorization = `Bearer ${newtoken}`;
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: rt,
        });
        const newToken: string = (resp as any).data?.access_token;
        const expiresIn: number = (resp as any).data?.expires_in ?? 300;
        const rtNew: string | undefined = (resp as any).data?.refresh_token;

        if (!newToken) throw new Error('No access_token in refresh response');

        setAccessToken(newToken, expiresIn);
        if (rtNew) setRefreshToken(rtNew); 

        isRefreshing = false;
        onRefreshed(newToken);

        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        isRefreshing = false;
        onRefreshed(null); 
        clearTokens();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default http;