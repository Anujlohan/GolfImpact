'use client';

import { useState } from 'react';
import { Charity } from '@/types/database';
import { adminSaveCharityAction, adminDeleteCharityAction } from '@/actions/charity';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';

interface AdminCharityModalProps {
  charity?: Charity | null;
  open: boolean;
  onClose: () => void;
}

export function AdminCharityModal({ charity, open, onClose }: AdminCharityModalProps) {
  const [name, setName] = useState(charity?.name || '');
  const [slug, setSlug] = useState(charity?.slug || '');
  const [category, setCategory] = useState(charity?.category || 'Education & Tech');
  const [description, setDescription] = useState(charity?.description || '');
  const [imageUrl, setImageUrl] = useState(charity?.image_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(charity?.website_url || '');
  const [isFeatured, setIsFeatured] = useState(charity?.is_featured ?? false);
  const [isActive, setIsActive] = useState(charity?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData();
    if (charity?.id) formData.append('id', charity.id);
    formData.append('name', name);
    formData.append('slug', slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    formData.append('category', category);
    formData.append('description', description);
    formData.append('imageUrl', imageUrl || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80');
    if (websiteUrl) formData.append('websiteUrl', websiteUrl);
    formData.append('isFeatured', isFeatured ? 'true' : 'false');
    formData.append('isActive', isActive ? 'true' : 'false');

    const res = await adminSaveCharityAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to save charity');
    }
  };

  const handleDelete = async () => {
    if (!charity?.id) return;
    if (!confirm(`Are you sure you want to delete "${charity.name}"?`)) return;

    setIsSubmitting(true);
    const res = await adminDeleteCharityAction(charity.id);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title={charity ? 'Edit Charity Organization' : 'Add New Charity Organization'}
      description="Manage non-profit partner listing, media, and description."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <Input
          label="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Code For Humanity"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Healthcare, Environment"
            required
          />
          <Input
            label="Slug Identifier"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. code-for-humanity"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-200">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded border border-border bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Describe the organization's mission and programs..."
            required
          />
        </div>

        <Input
          label="Cover Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        <Input
          label="Website URL (Optional)"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.org"
        />

        <div className="flex items-center gap-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-primary"
            />
            <span>Featured on Homepage</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-primary"
            />
            <span>Active Listing</span>
          </label>
        </div>

        {errorMsg && (
          <div className="rounded bg-rose-950/40 border border-rose-800 p-2 text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          {charity?.id ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              isLoading={isSubmitting}
            >
              Delete
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {charity ? 'Save Changes' : 'Create Charity'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
