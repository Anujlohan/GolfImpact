'use client';

import { useState } from 'react';
import { Score } from '@/types/database';
import { deleteScoreAction } from '@/actions/scores';
import { formatDate } from '@/lib/utils/dates';

interface ScoreTableProps {
  scores: Score[];
}

export function ScoreTable({ scores }: ScoreTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this score?')) return;
    setDeletingId(id);
    await deleteScoreAction(id);
    setDeletingId(null);
  };

  if (!scores || scores.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground border-y border-border">
        No scores registered yet. Enter your first score above.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      {scores.map((item, index) => (
        <div
          key={item.id}
          className="py-3 flex items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-muted-foreground w-12">
              Slot {index + 1}
            </span>
            <span className="font-mono font-bold text-sm text-white bg-slate-900 px-2 py-0.5 rounded border border-border">
              {item.score}
            </span>
            <span className="text-muted-foreground">
              {formatDate(item.score_date)}
            </span>
          </div>

          <button
            onClick={() => handleDelete(item.id)}
            disabled={deletingId === item.id}
            className="text-xs text-muted-foreground hover:text-rose-400 underline disabled:opacity-50"
          >
            {deletingId === item.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}
