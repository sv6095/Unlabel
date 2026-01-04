import React from 'react';
import { Navigate } from 'react-router-dom';
import { User, Mail, LogOut, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { AIWaveform } from '@/components/ui/AIWaveform';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ message: 'Please sign in to view your profile' }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 px-4 pb-16">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12">

          {/* LEFT — SYSTEM VIEW */}
          <div className="flex flex-col justify-center border-r border-border/40 pr-8">
            <div className="space-y-6">

              <AIWaveform variant="green" />

              <div>
                <h1 className="font-display text-3xl text-foreground">
                  {user?.name}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="w-4 h-4" />
                  <span className="font-body">{user?.email}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-border/40 space-y-2">
                <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                  System state
                </p>
                <p className="font-body text-sm text-foreground">
                  Authenticated user
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT — USER DATA */}
          <div className="space-y-6">

            {/* Identity */}
            <GlassCard variant="neutral" className="px-8 py-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 border border-border flex items-center justify-center">
                  <span className="font-display text-xl text-foreground">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="font-body text-muted-foreground text-sm">
                    Identity
                  </p>
                  <p className="font-body text-foreground">
                    {user?.name}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Activity */}
            <div className="grid sm:grid-cols-2 gap-4">
              <GlassCard variant="neutral" className="px-6 py-6">
                <Sparkles className="w-6 h-6 text-primary mb-2" />
                <div className="font-display text-2xl text-foreground">—</div>
                <p className="font-body text-sm text-muted-foreground">
                  Analyses
                </p>
              </GlassCard>

              <GlassCard variant="neutral" className="px-6 py-6">
                <User className="w-6 h-6 text-primary mb-2" />
                <div className="font-display text-2xl text-foreground">
                  Active
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  Status
                </p>
              </GlassCard>
            </div>

            {/* Account */}
            <GlassCard variant="neutral" className="px-8 py-8">
              <h2 className="font-display text-xl text-foreground mb-6">
                Account
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="font-body text-muted-foreground">Email</span>
                  <span className="font-body text-foreground">
                    {user?.email}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="font-body text-muted-foreground">
                    Member since
                  </span>
                  <span className="font-body text-foreground">
                    Today
                  </span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="font-body text-muted-foreground">
                    Plan
                  </span>
                  <span className="font-body text-primary">
                    Free
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Action */}
            <div className="pt-4">
              <GlassButton
                variant="secondary"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </GlassButton>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
