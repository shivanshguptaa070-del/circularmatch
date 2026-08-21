import type { Role } from '../types'
import { SellerDashboard } from './SellerDashboard'
import { BuyerDashboard } from './BuyerDashboard'
import { AdminDashboard } from './AdminDashboard'

export function AdminDashboard() {
  if (role === 'generator') return <SellerDashboard />
  if (role === 'buyer') return <BuyerDashboard />
  return <AdminDashboard />
}
