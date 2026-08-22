import type { ApiEnvelope } from '../types'
import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

/** Returns a stable random ID unique to this browser, persisted across page reloads. */
function getSessionId(): string {
  let id = localStorage.getItem('cm_session_id')
  if (!id) {
    // Generate a simple UUID-v4-like random string
    id = 'sess-' + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    localStorage.setItem('cm_session_id', id)
  }
  return id
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  const mode = localStorage.getItem('cm_active_mode') || (session?.user?.user_metadata?.active_mode as string) || 'selling'
  headers['X-Active-Mode'] = mode
  if (!session) {
    let demoSession = localStorage.getItem('cm_demo_session')
    if (!demoSession) {
      demoSession = Math.random().toString(36).substring(2, 8)
      localStorage.setItem('cm_demo_session', demoSession)
    }
    const rolePrefix = mode === 'sourcing' || mode === 'buyer' ? 'user-buyer' : 'user-generator'
    headers['X-Demo-User-Id'] = `${rolePrefix}-${demoSession}`
  }
  return headers
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
    let message = 'Something went wrong while contacting CircularMatch.'
    if (typeof detail === 'string') {
      message = detail
    } else if (Array.isArray(detail) && detail.length > 0) {
      message = detail.map((d: any) => d.msg || (typeof d === 'string' ? d : JSON.stringify(d))).join(', ')
    } else if (detail && typeof detail === 'object') {
      message = JSON.stringify(detail)
    }
    throw new Error(message)
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
