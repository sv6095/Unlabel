import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { AIWaveform } from '@/components/ui/AIWaveform';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 px-4 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12">

          {/* LEFT — AI CONTEXT */}
          <div className="flex flex-col justify-center border-r border-border/40 pr-8">
            <div className="space-y-6">
              <AIWaveform variant="green" />

              <h1 className="font-display text-3xl text-foreground leading-tight">
                Welcome back
              </h1>

              <p className="font-body text-muted-foreground max-w-sm">
                Sign in to continue your journey
              </p>

              <div className="pt-6 border-t border-border/40">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                  System state
                </p>
                <p className="font-body text-sm text-foreground">
                  Identity verification required
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — USER INPUT */}
          <div>
            {/* Auth redirect message */}
            {message && (
              <GlassCard variant="red" className="mb-6 px-4 py-3 text-center">
                <p className="font-body text-secondary-foreground">
                  {message}
                </p>
              </GlassCard>
            )}

            <GlassCard variant="green" className="px-8 py-10">

              <form onSubmit={handleSubmit} className="space-y-6">

                {error && (
                  <div className="border border-secondary/30 bg-secondary/20 px-4 py-3">
                    <p className="font-body text-sm text-secondary-foreground">
                      {error}
                    </p>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={cn(
                        "bg-background border-border",
                        "focus:border-primary focus:ring-primary/20"
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={cn(
                        "bg-background border-border",
                        "focus:border-primary focus:ring-primary/20"
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <AIWaveform variant="green" className="scale-75" />
                    ) : (
                      'Sign In'
                    )}
                  </GlassButton>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="font-body text-muted-foreground text-sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="text-primary underline underline-offset-4"
                  >
                    Create one
                  </Link>
                </p>
              </div>

            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
