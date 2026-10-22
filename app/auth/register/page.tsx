'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { ArrowLeft, BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/dashboard');
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: registerError } = await supabase.auth.signUp({ email, password });
    
    if (registerError) {
      setError(registerError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/dashboard`,
      },
    });
    
    if (googleError) setError(googleError.message);
  };

  const passwordStrength = (pass: string) => {
    if (pass.length < 6) return { strength: 'weak', color: 'bg-red-500' };
    if (pass.length < 10) return { strength: 'medium', color: 'bg-yellow-500' };
    return { strength: 'strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength(password);

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 py-12">
      {/* Soft background glow */}
      <div className="bg-hero-glow pointer-events-none absolute inset-0" />
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Home
        </Link>
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-5 shadow-lift">
            <BookOpen className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Start your learning journey today
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-lift">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-success text-sm font-medium">Account created successfully!</p>
                <p className="text-success/80 text-xs mt-1">Check your email for verification link. Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading || success}
            className="w-full mb-6 px-4 py-3 bg-card hover:bg-muted text-foreground border border-border rounded-lg font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card/50 text-muted-foreground">Or register with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground/80" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground/80" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: password.length < 6 ? '33%' : password.length < 10 ? '66%' : '100%' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{strength.strength}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">At least 6 characters recommended</p>
                </div>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-brand hover:text-brand">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand hover:text-brand">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full px-4 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-full font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Account created!
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand hover:text-brand font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}