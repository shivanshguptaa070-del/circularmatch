import type { ApiEnvelope } from '../types'
import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` }
  }
  return {}
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const authHeaders = await getAuthHeader()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  Object.entries(authHeaders).forEach(([k, v]) => headers.set(k, v))

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = payload?.detail
    throw new Error(typeof detail === 'string' ? detail : 'Something went wrong while contacting CircularMatch.')
  }
  return payload as ApiEnvelope<T>
}

export const get = <T>(path: string) => api<T>(path)
export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
export const patch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) })

export async function getNotifications() {
  return get<{ notifications: import('../types').Notification[] }>('/api/notifications')
}

export async function markNotificationRead(notificationId: string) {
  return patch<{ notification: import('../types').Notification }>(`/api/notifications/${notificationId}/read`, {})
}

// Legacy compatibility — no-op, auth is handled by Supabase
export function getStoredUser() { return null }
export function setStoredUser(_user: unknown) { void _user }
export function clearStoredUser() { supabase.auth.signOut().catch(() => null) }
