const ACCESS_KEY ='access_token'; //tokenที่ใช้เรียก API
const REFRESH_KEY = 'refresh_token';//tokenที่ใช้ขอโทเค็นใหม่เมื่อหมดอายุ
const EXPIRES_IN_KEY = 'expires_at';//ระยะเวลาที่ Access Token จะหมดอายุ 

export function setAccessToken(token:string, expireInSec: number) {
    // บันทึก Access Token ลงใน localStorage 
   localStorage.setItem(ACCESS_KEY, token);

   const expiresAt = Date.now() + (Number (expireInSec) || 0)* 1000;
   localStorage.setItem(EXPIRES_IN_KEY, String(expiresAt)); 
}

export function setRefreshToken(token:string) {
    // บันทึก Refresh Token ลงใน localStorage 
    localStorage.setItem(REFRESH_KEY, token);
}
//--------------อ่านโทเค็นจาก localStorage----------------
export function getAccessToken(){
    // ดึง Access Token ที่ถูกเก็บไว้ใน localStorage 
    // หากไม่มีข้อมูล คืนค่า null
    return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(){
    // ดึง Refresh Token ที่ถูกเก็บไว้ใน localStorage 
    // หากไม่มีข้อมูล คืนค่า null
    return localStorage.getItem(REFRESH_KEY);
}

//--------------ตรวจสอบโทเค็นหมดอายุหรือไม่----------------
export function isAccessTokenExpired() {
    // โทเค็นหมดอายุหรือไม่
    //หากไม่มีค่า (ยังไม่ได้ล็อกอิน) ค่าเริ่มต้น=0
    const ts = Number(localStorage.getItem(EXPIRES_IN_KEY));
    
    if (!ts) return true;
    return Date.now() >= (ts - 60_000);
}
//--------------ล้างโทเค็นออกจาก localStorage----------------
export function clearTokens() {
    // ลบโทเค็นทั้งหมดที่เก็บไว้ใน localStorage 
    // เพื่อให้ผู้ใช้ ลงชื่อออก และไม่สามารถเข้าถึงข้อมูลได้อีก
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);
}

