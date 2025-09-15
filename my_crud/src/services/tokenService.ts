const ACCESS_KEY ='access_token'; //tokenที่ใช้เรียก API
const REFRESH_KEY = 'refresh_token';//tokenที่ใช้ขอโทเค็นใหม่เมื่อหมดอายุ
const EXPIRES_IN_KEY = 'expires_at';//ระยะเวลาที่ Access Token จะหมดอายุ 

export function setTokens(accessToken: string, refreshToken: string, expiresSec: number) {
     // บันทึก Access Token และ Refresh Token ลงในเบราว์เซอร์
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);

    //กันเวลาเหลื่อมออก 5 วิก่อนหมดอายุจริง
    const expiresAt = (Date.now() + (expiresSec ?? 300))* 1000 - 5000; 

    //บันทึกเวลาหมดอายุในรูปแบบ timestamp ไว้ใน localStorage
    localStorage.setItem(EXPIRES_IN_KEY, String(expiresAt));
}

export function setAccessToken(access:string, expireInSec: number) {
    // บันทึก Access Token ลงใน localStorage 
   localStorage.setItem(ACCESS_KEY, access);

   const expireInSecAt = (Date.now() + (expireInSec ?? 300))* 1000 - 5000;
   localStorage.setItem(EXPIRES_IN_KEY, String(expireInSecAt)); 
}

export function getAccessToken(): string | null {
    // ดึง Access Token ที่ถูกเก็บไว้ใน localStorage 
    // หากไม่มีข้อมูล คืนค่า null
    return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
    // ดึง Refresh Token ที่ถูกเก็บไว้ใน localStorage 
    // หากไม่มีข้อมูล คืนค่า null
    return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
    // ลบโทเค็นทั้งหมดที่เก็บไว้ใน localStorage 
    // เพื่อให้ผู้ใช้ ลงชื่อออก และไม่สามารถเข้าถึงข้อมูลได้อีก
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);
}

export function isAccessTokenExpired(): boolean {
    // โทเค็นหมดอายุหรือไม่
    //หากไม่มีค่า (ยังไม่ได้ล็อกอิน) ค่าเริ่มต้น=0
    const exp = Number(localStorage.getItem(EXPIRES_IN_KEY) || '0');
    // ดึง Access Token ปัจจุบัน
    const token = getAccessToken();
    
    //token หมดอายุแล้ว คืนค่า true
    return !token || Date.now() >= exp;
}

