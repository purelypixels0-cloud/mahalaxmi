import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, isCmsEnabled } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import ProductsAdmin from './ProductsAdmin'
import CategoriesAdmin from './CategoriesAdmin'
import PostsAdmin from './PostsAdmin'
import CollectionsAdmin from './CollectionsAdmin'
import SchemesAdmin from './SchemesAdmin'
import TeamAdmin from './TeamAdmin'
import FaqsAdmin from './FaqsAdmin'
import TestimonialsAdmin from './TestimonialsAdmin'
import SettingsAdmin from './SettingsAdmin'

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!isCmsEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-maroon px-6 font-body">
        <div className="max-w-sm rounded-[22px] bg-ivory p-8 text-center shadow-elevated">
          <h1 className="font-display text-2xl text-teal-deep">CMS not connected</h1>
          <p className="mt-2 font-body text-sm text-ink-muted">
            The admin panel needs the Supabase keys configured on the server first.
          </p>
        </div>
      </div>
    )
  }

  if (session === undefined) {
    return <div className="min-h-screen bg-maroon" />
  }

  if (!session) {
    return <AdminLogin onDone={() => {}} />
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="posts" element={<PostsAdmin />} />
        <Route path="collections" element={<CollectionsAdmin />} />
        <Route path="schemes" element={<SchemesAdmin />} />
        <Route path="team" element={<TeamAdmin />} />
        <Route path="faqs" element={<FaqsAdmin />} />
        <Route path="testimonials" element={<TestimonialsAdmin />} />
        <Route path="content" element={<SettingsAdmin />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    </AdminLayout>
  )
}
