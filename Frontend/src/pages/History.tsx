import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  title: string | null;
  preview: string;
  variant: 'green' | 'red' | 'neutral';
}

const History = () => {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get<HistoryItem[]>('/analyze/history');
        setHistory(response.data);
      } catch {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ message: 'Sign in to view your analysis history' }}
      />
    );
  }

  const startEditing = (item: HistoryItem) => {
    setEditingId(item.id);
    setDraftTitle(item.title || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftTitle('');
  };

  const saveTitle = async (id: string) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === id ? { ...item, title: draftTitle } : item
      )
    );

    setEditingId(null);

    // Optional: persist to backend
    // await api.patch(`/analyze/${id}/title`, { title: draftTitle });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 px-4 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12">

          {/* LEFT — SYSTEM CONTEXT */}
<div className="sticky top-28 self-start flex flex-col border-r border-border/40 pr-8">
  <div className="space-y-6">
    <h1 className="font-display text-3xl text-foreground">
      Your History
    </h1>
    <p className="font-body text-muted-foreground max-w-sm">
      Review past food analyses and insights
    </p>

    <div className="pt-6 border-t border-border/40">
      <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">
        System state
      </p>
      <p className="font-body text-sm text-foreground">
        Archived analyses available
      </p>
    </div>
  </div>
</div>

          {/* RIGHT — HISTORY LIST */}
          <div className="space-y-4">

            {loading && (
              <GlassCard variant="neutral" className="px-6 py-6 text-center">
                <p className="font-body text-muted-foreground">
                  Loading history…
                </p>
              </GlassCard>
            )}

            {error && (
              <GlassCard variant="red" className="px-6 py-6 text-center">
                <p className="font-body text-foreground">{error}</p>
              </GlassCard>
            )}

            {!loading && !error && history.length === 0 && (
              <GlassCard variant="neutral" className="px-8 py-10 text-center">
                <h3 className="font-display text-lg text-foreground mb-2">
                  No Analyses Yet
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-6">
                  Start scanning food labels to build your personal food intelligence history.
                </p>
                <Link to="/analyze">
                  <GlassButton variant="primary">
                    Start First Analysis
                  </GlassButton>
                </Link>
              </GlassCard>
            )}

            {history.map(item => (
              <GlassCard
                key={item.id}
                variant={item.variant}
                className="px-6 py-5"
              >
                <div className="space-y-2">

                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>

                  {editingId === item.id ? (
                    <input
                      autoFocus
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      onBlur={() => saveTitle(item.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveTitle(item.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                      className="w-full bg-background border border-border px-2 py-1 text-foreground font-display text-lg"
                      placeholder="Untitled Analysis"
                    />
                  ) : (
                    <h3
                      onClick={() => startEditing(item)}
                      className="font-display text-lg text-foreground cursor-text"
                    >
                      {item.title || 'Untitled Analysis'}
                    </h3>
                  )}

                  <p className="font-body text-sm text-muted-foreground truncate">
                    {item.preview}
                  </p>

                  <div className="pt-2">
                    <Link
                      to={`/analyze/${item.id}`}
                      className="font-body text-sm text-primary underline underline-offset-4"
                    >
                      Open analysis
                    </Link>
                  </div>

                </div>
              </GlassCard>
            ))}

            {history.length > 0 && (
              <div className="pt-6">
                <Link to="/analyze">
                  <GlassButton variant="primary" className="w-full">
                    Start New Analysis
                  </GlassButton>
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
