import { redirect } from 'next/navigation'

// Redirect to the dashboard route which includes the proper layout
export default function HomePage() {
  redirect('/dashboard')
}