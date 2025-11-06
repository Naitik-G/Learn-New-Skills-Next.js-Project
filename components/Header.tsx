// components/Header.tsx
'use client'

import { useState } from 'react'
import { BookOpen, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const publicNavLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#testimonials' },
]

const authenticatedNavLinks = [
  { label: 'Vocabulary', href: '/vocabulary', icon: BookOpen },
  { label: 'Topics', href: '/aiTopic', icon: BookOpen },
  { label: 'Pronunciation', href: '/pronunciation', icon: BookOpen },
  { label: 'Quiz', href: '/quiz', icon: BookOpen },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    setIsProfileOpen(false)
  }

  // Show loading state
  if (loading) {
    return (
      <header className="border-b bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.png"
                  alt="LearnHub Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                LearnHub
              </span>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
          <div className="w-10 h-10 relative">
            <Image
              src="/logo.png"
              alt="LearnHub Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LearnHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            // Authenticated Navigation
            <>
              {authenticatedNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4 text-slate-300" />
                  <span className="text-slate-300 text-sm">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Public Navigation
            <>
              {publicNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/auth/login"
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                           hover:from-blue-500 hover:to-purple-500 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 shadow-lg md:hidden">
            <nav className="flex flex-col p-4 space-y-3">
              {user ? (
                // Authenticated Mobile Menu
                <>
                  <div className="pb-3 border-b border-slate-800">
                    <p className="text-slate-400 text-sm">Signed in as</p>
                    <p className="text-slate-200 font-medium">{user.email}</p>
                  </div>
                  {authenticatedNavLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-slate-300 hover:text-white transition-colors py-2 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                // Public Mobile Menu
                <>
                  {publicNavLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                               hover:from-blue-500 hover:to-purple-500 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}