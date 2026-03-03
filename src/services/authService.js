// src/services/authService.js
// Matches exactly: POST /auth/login  and  GET /auth/me  in Flow-Back

import { origins } from '../pages/Managment';

/**
 * POST /auth/login
 * FastAPI's OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
 * Returns { access_token, token_type }
 */
export async function loginRequest(username, password) {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const res = await fetch(`${origins}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

/**
 * GET /auth/me
 * Sends JWT in Authorization header.
 * Returns { id, username, role } — no password_hash ever.
 */
export async function getMeRequest(token) {
  if (!token) return null;

  const res = await fetch(`${origins}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}
