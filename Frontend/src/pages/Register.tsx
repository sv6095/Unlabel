import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { AIWaveform } from '@/components/ui/AIWaveform';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      navigate('/');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 px-4 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12">

          {/* LEFT — AI PROMPT */}
          <div className="flex flex-col justify-center border-r border-border/40 pr-8">
            <div className="space-y-6">
              <AIWaveform variant="mixed" />

              <h1 className="font-display text-3xl text-foreground leading-tight">
                Begin your journey
              </h1>

              <p className="font-body text-muted-foreground max-w-sm">
                Create an account to unlock personalized insights
              </p>

              <div className="pt-6 border-t border-border/40">
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                  System state
                </p>
                <p className="font-body text-sm text-foreground">
                  Awaiting user input
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — USER RESPONSE */}
          <div>
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
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="bg-background border-border"
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
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-background border-border"
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
                      'Create Account'
                    )}
                  </GlassButton>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-border/40 text-center">
                <p className="font-body text-muted-foreground text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary underline underline-offset-4"
                  >
                    Sign in
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

export default Register;
