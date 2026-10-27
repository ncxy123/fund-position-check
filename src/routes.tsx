import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layout/app-layout'
import { HomePage } from '@/pages/home'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
