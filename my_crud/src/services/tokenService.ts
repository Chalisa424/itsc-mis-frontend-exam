const ACCESS_KEY ='access_token'; //tokenที่ใช้เรียก API
const REFRESH_KEY = 'refresh_token';//tokenที่ใช้ขอโทเค็นใหม่เมื่อหมดอายุ
const EXPIRES_IN_KEY = 'expires_at';//ระยะเวลาที่ Access Token จะหมดอายุ 
const DEFAULT_MARGIN_MS = 60_000; // กันหมดอายุล่วงหน้า 60s

export function setAccessToken(token:string, expireInSec: number) {
    // บันทึก Access Token ลงใน localStorage 
   localStorage.setItem(ACCESS_KEY, token);
   const sec = Number(expireInSec) || 0; 
   const expiresAt = Date.now() + sec * 1000;
   localStorage.setItem(EXPIRES_IN_KEY, String(expiresAt)); 
}

export function setRefreshToken(token:string) {
    // บันทึก Refresh Token ลงใน localStorage 
    localStorage.setItem(REFRESH_KEY, token);
}

/** ตั้งค่าพร้อมกันทีเดียว: access + refresh + expires_in */
export function setTokens(params: { accessToken: string; refreshToken: string; expiresInSec?: number }) {
  const { accessToken, refreshToken, expiresInSec = 300 } = params;
  setAccessToken(accessToken, expiresInSec);
  setRefreshToken(refreshToken);
}


export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}


export function getExpiresAt(): number | null {
  const raw = localStorage.getItem(EXPIRES_IN_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

//เวลาคงเหลือก่อนหมดอายุ 
export function getRemainingMs(): number {
  const at = getExpiresAt();
  if (!at) return 0;
  return Math.max(0, at - Date.now());
}

// ---------- state checks ----------
/**
 * โทเค็นหมดอายุหรือยัง (เผื่อ margin ล่วงหน้า)
 * @param marginMs 
 */
export function isAccessTokenExpired(marginMs: number = DEFAULT_MARGIN_MS) {
  const at = getExpiresAt();
  if (!at) return true; 
  return Date.now() >= at - marginMs;
}

// มีสถานะล็อกอินหรือยัง (มี refresh token และ access ไม่หมดเกิน margin) 
export function isLoggedIn(marginMs: number = DEFAULT_MARGIN_MS) {
  return !!getRefreshToken() && !isAccessTokenExpired(marginMs);
}

// ---------- clear ----------
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_IN_KEY);
}