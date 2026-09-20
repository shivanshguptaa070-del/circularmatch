import type { ApiEnvelope } from '../types'
import { supabase } from './supabase'
import { handleDemoFallback } from './demoData'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function getAuthHeader(): Promise<Record<string, string>> {
  const demoMode = localStorage.getItem('cm_demo')
  const mode = localStorage.getItem('cm_active_mode') || 'selling'
  const headers: Record<string, string> = {
    'X-Active-Mode': mode,
  }

  // 1. Explicit Hackathon Demo Account takes highest priority
  if (demoMode === 'admin') {
    headers['X-Demo-User-Id'] = 'user-admin'
    return headers
  } else if (demoMode === 'seller') {
    headers['X-Demo-User-Id'] = 'user-generator'
    return headers
  } else if (demoMode === 'buyer') {
    headers['X-Demo-User-Id'] = 'user-buyer'
    return headers
  }

  // 2. Real Authenticated Supabase User
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
      return headers
    }
  } catch {
    // ignore supabase auth errors in offline/demo mode
  }

  // 3. Unauthenticated random visitor — ephemeral session
  let demoSession = localStorage.getItem('cm_demo_session')
  if (!demoSession) {
    demoSession = Math.random().toString(36).substring(2, 8)
    localStorage.setItem('cm_demo_session', demoSession)
  }
  const rolePrefix = mode === 'sourcing' || mode === 'buyer' ? 'user-buyer' : 'user-generator'
  headers['X-Demo-User-Id'] = `${rolePrefix}-${demoSession}`

  return headers
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const authHeaders = await getAuthHeader()
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  Object.entries(authHeaders).forEach(([k, v]) => headers.set(k, v))

  const demoMode = localStorage.getItem('cm_demo')
  const isDemoActive = Boolean(demoMode || headers.get('X-Demo-User-Id'))

  try {
    // 8-second timeout for snappy response during judging / demo presentations
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      // If server returned 502, 503, 504 (e.g. Render sleeping/waking up) or 401/403/404 in demo mode
      if ((response.status >= 500 || response.status === 404 || response.status === 401 || response.status === 403) && isDemoActive) {
        const fallback = handleDemoFallback<T>(path, options)
        if (fallback) {
          console.warn(`[CircularMatch Demo] Server returned ${response.status} for ${path}. Serving verified demo data.`)
          return fallback
        }
      }

      const payload = await response.json().catch(() => null)
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

    const payload = await response.json().catch(() => null)
    return payload as ApiEnvelope<T>
  } catch (cause) {
    // Seamless fallback for offline, network timeout, connection refused, or cold-start failure
    if (isDemoActive || path.startsWith('/api/reference/') || path.startsWith('/api/map') || path.startsWith('/api/dashboard/')) {
      const fallback = handleDemoFallback<T>(path, options)
      if (fallback) {
        console.warn(`[CircularMatch Demo] Network fetch failed for ${path} (${cause instanceof Error ? cause.message : 'network error'}). Serving verified demo data.`)
        return fallback
      }
    }
    throw cause
  }
}

export const get = <T>(path: string) => api<T>(path)
export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined })
export const patch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
export const put = <T>(path: string, body: unknown) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body) })
export const del = <T>(path: string) => api<T>(path, { method: 'DELETE' })

export async function getNotifications() {
  return get<{ notifications: import('../types').Notification[] }>('/api/notifications')
}

export async function markNotificationRead(notificationId: string) {
  return patch<{ notification: import('../types').Notification }>(`/api/notifications/${notificationId}/read`, {})
}

