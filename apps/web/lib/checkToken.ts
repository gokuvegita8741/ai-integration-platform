// utils/checkToken.ts
import {jwtDecode} from "jwt-decode";

interface JwtPayload {
  exp?: number; // expiry in seconds
  [key: string]: unknown;
}

/**
 * Checks if a JWT access token has expired
 * @param token - JWT string
 * @returns true if expired, false if still valid
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true; // no token = expired

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) return true; // no exp field = expired

    const expiryTime = decoded.exp * 1000; // convert seconds -> milliseconds
    return Date.now() > expiryTime;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return true; // invalid token = expired
  }
}
