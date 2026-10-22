// components/Header.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BookOpen, Menu, X, LogOut, ChevronDown, LayoutDashboard,
  Languages, Mic, Brain, MessagesSquare,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/theme/ThemeToggle'

const publicNavLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Services', href: '/#services' },
]

const authenticatedNavLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Vocabulary', href: '/vocabulary', icon: BookOpen },
  { label: 'Topics', href: '/aiTopic', icon: MessagesSquare },
  { label: 'Pronunciation', href: '/custom-sentences', icon: Mic },
  { label: 'Quiz', href: '/quiz', icon: Brain },
]

function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group" aria-label="LearnHub home">
      <span className="relative size-9 overflow-hidden rounded-xl bg-brand-soft ring-1 ring-border">
        <Image src="/logo.png" alt="" width={36} height={36} className="object-contain" priority />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Learn<span className="text-brand">Hub</span>
      </span>
    </Link>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [pathname])

  // Close profile dropdown on outside click / Escape
  useEffect(() => {
    if (!isProfileOpen) return
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsProfileOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isProfileOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    setIsProfileOpen(false)
    setIsMenuOpen(false)
  }

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname?.startsWith(href + '/'))

  const shell = `sticky top-0 z-50 border-b transition-all ${
    scrolled ? 'border-border bg-background/85 backdrop-blur-xl shadow-soft' : 'border-transparent bg-background/60 backdrop-blur-md'
  }`

  if (loading) {
    return (
      <header className={shell}>
        <div className="container-app flex h-16 items-center justify-between">
          <Logo href="/" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      </header>
    )
  }

  const initial = (user?.email?.[0] ?? 'U').toUpperCase()
  const username = user?.email?.split('@')[0]

  return (
    <header className={shell}>
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Logo href={user ? '/dashboard' : '/'} />

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {user
            ? authenticatedNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))
            : publicNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 transition-colors hover:bg-accent"
              >
                <span className="grid size-7 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
                  {initial}
                </span>
                <span className="max-w-[8rem] truncate text-sm font-medium">{username}</span>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div
                  role="menu"
                  className="animate-fade-in absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-lift"
                >
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="truncate text-sm font-medium">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <Link
                    role="menuitem"
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard className="size-4 text-muted-foreground" /> Dashboard
                  </Link>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-90 hover:shadow-lift"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="animate-fade-in border-t border-border bg-background md:hidden">
          <nav className="container-app flex flex-col gap-1 py-3" aria-label="Mobile">
            {user ? (
              <>
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted p-3">
                  <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">{initial}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="truncate text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                {authenticatedNavLinks.map((link) => {
                  const Icon = link.icon ?? Languages
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                        isActive(link.href) ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="size-4" /> {link.label}
                    </Link>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </>
            ) : (
              <>
                {publicNavLinks.map((link) => (
                  <Link key={link.label} href={link.href} className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted">
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link href="/auth/login" className="rounded-full border border-border py-2.5 text-center text-sm font-medium">
                    Sign in
                  </Link>
                  <Link href="/auth/register" className="rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground">
                    Get started
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
