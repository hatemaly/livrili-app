// This page is the root of the (dashboard) route group
// Redirect to /dashboard to avoid confusion
import { redirect } from 'next/navigation'

export default function DashboardRootPage() {
  redirect('/dashboard')
}