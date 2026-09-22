'use client';

import { useState } from 'react';
import { Charity } from '@/types/database';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import { AdminCharityModal } from './AdminCharityModal';

interface AdminCharityTableProps {
  charities: Charity[];
}

export function AdminCharityTable({ charities }: AdminCharityTableProps) {
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddNew = () => {
    setSelectedCharity(null);
    setModalOpen(true);
  };

  const handleEdit = (c: Charity) => {
    setSelectedCharity(c);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-xs text-muted-foreground">{charities.length} total organizations</span>
        <Button size="sm" onClick={handleAddNew}>
          + Add Charity
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cause Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Total Raised</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {charities && charities.length > 0 ? (
            charities.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-white">
                  {c.name}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.category}
                </TableCell>
                <TableCell className="text-xs font-semibold text-emerald-400 font-mono">
                  {formatCurrency(c.total_raised || 0)}
                </TableCell>
                <TableCell>
                  {c.is_featured ? (
                    <Badge variant="default">Featured</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Standard</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={c.is_active ? 'default' : 'secondary'}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                No charities configured.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AdminCharityModal
        charity={selectedCharity}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
