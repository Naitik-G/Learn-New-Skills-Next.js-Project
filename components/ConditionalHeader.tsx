// components/ConditionalHeader.tsx
'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Don't show header on auth pages
  const hideHeader = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/auth/')
  
  if (hideHeader) return null
  
  return <Header />
}