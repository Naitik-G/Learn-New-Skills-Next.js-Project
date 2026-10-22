
import React from 'react'
import {
  BookOpen, Mic, Brain, Trophy, ArrowRight, Check, Users, Target, Clock,
  Calculator, Palette, Sparkles, Play, Volume2,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Reading',
    description: 'Read diverse topics with instant word definitions and translations.',
    tone: 'bg-info/12 text-info',
    path: '/aiTopic',
    span: 'lg:col-span-2',
  },
  {
    icon: Mic,
    title: 'Pronunciation Practice',
    description: 'AI-powered speech recognition with real-time feedback and phonetics.',
    tone: 'bg-success/12 text-success',
    path: '/pronunciation',
    span: '',
  },
  {
    icon: Brain,
    title: 'Vocabulary Builder',
    description: 'Smart word tracking and spaced repetition for lasting retention.',
    tone: 'bg-warning/20 text-amber-700 dark:text-warning',
    path: '/vocabulary',
    span: '',
  },
  {
    icon: Trophy,
    title: 'Progress Tracking',
    description: 'Monitor your improvement with detailed analytics and achievements.',
    tone: 'bg-brand/12 text-brand',
    path: '/auth/login',
    span: 'lg:col-span-2',
  },
]

const steps = [
  { n: '01', title: 'Pick a topic you care about', body: 'Choose from curated topics or let AI generate a conversation on anything.' },
  { n: '02', title: 'Read, listen, and speak', body: 'Tap any word for a definition, hear it spoken, then practise saying it yourself.' },
  { n: '03', title: 'Lock it in with quizzes', body: 'Quick quizzes and vocabulary reviews turn new words into long-term memory.' },
]

const additionalServices = [
  {
    category: 'Core Language Skills',
    icon: BookOpen,
    tone: 'bg-info/12 text-info',
    items: [
      'Grammar lessons with interactive exercises',
      'Writing practice with AI feedback',
      'Listening comprehension with podcasts/videos',
      'Cultural context and idioms learning',
      'Business/Academic English modules',
    ],
  },
  {
    category: 'STEM Education',
    icon: Calculator,
    tone: 'bg-success/12 text-success',
    items: [
      'Math problem solving with step-by-step explanations',
      'Physics concepts with visual simulations',
      'Chemistry experiments and equations',
      'Biology topics with interactive diagrams',
      'Computer Science & coding tutorials',
    ],
  },
  {
    category: 'Creative & Arts',
    icon: Palette,
    tone: 'bg-destructive/10 text-destructive',
    items: [
      'Creative writing workshops',
      'Music theory and composition',
      'Art history and techniques',
      'Photography fundamentals',
      'Design principles',
    ],
  },
  {
    category: 'Professional Skills',
    icon: Target,
    tone: 'bg-warning/20 text-amber-700 dark:text-warning',
    items: [
      'Interview preparation',
      'Public speaking training',
      'Resume/CV writing assistance',
      'Negotiation skills',
      'Email and business communication',
    ],
  },
]

const stats = [
  { label: 'Active learners', value: '10+', icon: Users },
  { label: 'Learning hours', value: '50+', icon: Clock },
  { label: 'Topics available', value: '4+', icon: BookOpen },
  { label: 'Success rate', value: '94%', icon: Trophy },
]

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand/10 blur-3xl" />
      <div className="card-surface p-5 shadow-lift">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="size-3.5" /> Today&rsquo;s word
          </span>
          <span className="text-xs text-muted-foreground">Level · Intermediate</span>
        </div>
        <p className="font-display text-4xl font-semibold tracking-tight">Resilient</p>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>/rɪˈzɪl.i.ənt/</span>
          <span className="grid size-6 place-items-center rounded-full bg-muted"><Volume2 className="size-3.5" /></span>
        </div>
        <p className="mt-4 rounded-xl bg-muted p-3 text-sm leading-relaxed text-foreground/80">
          &ldquo;Learners who practise a little every day become more <span className="font-semibold text-brand">resilient</span> than those who cram.&rdquo;
        </p>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-medium">Pronunciation accuracy</span>
            <span className="font-semibold text-success">92%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[92%] rounded-full bg-success" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[['7', 'day streak'], ['48', 'words'], ['86%', 'quiz avg']].map(([v, l]) => (
            <div key={l} className="rounded-xl border border-border bg-background py-2.5">
              <div className="text-lg font-bold">{v}</div>
              <div className="text-[11px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-hero-glow absolute inset-0 -z-10" />
        <div className="bg-dots absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="container-app grid items-center gap-14 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28">
          <div className="animate-rise text-center lg:text-left">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
              <span className="size-1.5 rounded-full bg-success" /> AI-powered English practice
            </span>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] md:text-6xl lg:text-7xl">
              Learn English by <span className="text-brand-gradient italic">using</span> it.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:mx-0">
              Read real topics, speak with instant feedback, and build vocabulary that sticks. 
              Then expand into math, science and more, all in one place.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lift transition-all hover:opacity-90"
              >
                Start learning free
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-medium transition-colors hover:bg-accent"
              >
                <Play className="size-4" /> See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Free to start · No credit card needed</p>
          </div>
          <div className="animate-rise [animation-delay:120ms]">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Platform stats" className="border-y border-border bg-card/60">
        <div className="container-app grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-center gap-3 md:justify-start">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="font-display text-2xl font-semibold leading-none">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 py-20 md:py-28">
        <div className="container-app">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">Features</p>
            <h2 className="text-4xl font-semibold md:text-5xl">Everything you need to learn</h2>
            <p className="mt-4 text-lg text-muted-foreground">Comprehensive tools powered by modern AI, designed to feel simple.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, tone, path, span }) => (
              <Link
                key={title}
                href={path}
                className={`group card-surface relative flex flex-col p-7 transition-all hover:-translate-y-1 hover:shadow-lift ${span}`}
              >
                <span className={`mb-5 grid size-12 place-items-center rounded-2xl ${tone}`}>
                  <Icon className="size-6" />
                </span>
                <h3 className="text-2xl font-semibold">{title}</h3>
                <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-all group-hover:gap-2.5">
                  Explore <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/60 py-20 md:py-24">
        <div className="container-app">
          <h2 className="mx-auto mb-12 max-w-2xl text-center text-4xl font-semibold md:text-5xl">A simple daily loop</h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="card-surface p-7">
                <span className="font-display text-5xl font-semibold text-brand/30">{s.n}</span>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-20 py-20 md:py-28">
        <div className="container-app">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">Beyond language</p>
            <h2 className="text-4xl font-semibold md:text-5xl">Expand your knowledge</h2>
            <p className="mt-4 text-lg text-muted-foreground">Go past vocabulary with educational content across subjects.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {additionalServices.map(({ category, icon: Icon, tone, items }) => (
              <div key={category} className="card-surface p-7 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
                    <Icon className="size-6" />
                  </span>
                  <h3 className="text-2xl font-semibold">{category}</h3>
                </div>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground/80">
                      <Check className="mt-0.5 size-5 shrink-0 text-success" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-28">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground md:px-12 md:py-20">
            <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-black/10 blur-2xl" />
            <h2 className="relative mx-auto max-w-2xl text-4xl font-semibold md:text-5xl">Ready to start your learning journey?</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg opacity-85">
              Join learners improving their English every day. It takes less than a minute to begin.
            </p>
            <Link
              href="/auth/register"
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-background px-8 py-3.5 text-base font-semibold text-foreground shadow-lift transition-transform hover:scale-[1.03]"
            >
              Get started for free <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container-app">
          <div className="mb-10 grid gap-10 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="relative size-9 overflow-hidden rounded-xl bg-brand-soft ring-1 ring-border">
                  <Image src="/logo.png" alt="" width={36} height={36} className="object-contain" />
                </span>
                <span className="font-display text-xl font-semibold">Learn<span className="text-brand">Hub</span></span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                Empowering learners worldwide with AI-powered education.
              </p>
            </div>
            <FooterCol title="Product" links={[['Features', '/#features'], ['Services', '/#services'], ['Dashboard', '/dashboard']]} />
            <FooterCol title="Learn" links={[['Vocabulary', '/vocabulary'], ['Pronunciation', '/pronunciation'], ['Quizzes', '/quiz']]} />
            <FooterCol title="Account" links={[['Sign in', '/auth/login'], ['Create account', '/auth/register']]} />
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} LearnHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-4 font-sans text-sm font-semibold">{title}</h4>
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="transition-colors hover:text-foreground">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
