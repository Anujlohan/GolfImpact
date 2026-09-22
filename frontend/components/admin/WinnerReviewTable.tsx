'use client';

import { useState } from 'react';
import { WinnerWithDetails } from '@/types';
import { WinnerReviewModal } from '@/components/winners/WinnerReviewModal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';

interface WinnerReviewTableProps {
  winners: WinnerWithDetails[];
}

export function WinnerReviewTable({ winners }: WinnerReviewTableProps) {
  const [selectedWinner, setSelectedWinner] = useState<WinnerWithDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenReview = (winner: WinnerWithDetails) => {
    setSelectedWinner(winner);
    setModalOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Winner</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Prize</TableHead>
            <TableHead>Proof Status</TableHead>
            <TableHead>Payout Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {winners && winners.length > 0 ? (
            winners.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-semibold text-white">
                  {w.profile?.full_name || w.user_id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground font-mono">
                    {w.tier.replace('_', ' ')} ({w.matched_count} matches)
                  </span>
                </TableCell>
                <TableCell className="text-xs font-semibold text-emerald-400">
                  {formatCurrency(w.prize_amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      w.verification_status === 'APPROVED'
                        ? 'default'
                        : w.verification_status === 'REJECTED'
                        ? 'destructive'
                        : 'warning'
                    }
                  >
                    {w.verification_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={w.payout_status === 'PAID' ? 'default' : 'secondary'}>
                    {w.payout_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleOpenReview(w)}
                  >
                    Review Proof
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                No winners found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <WinnerReviewModal
        winner={selectedWinner}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
