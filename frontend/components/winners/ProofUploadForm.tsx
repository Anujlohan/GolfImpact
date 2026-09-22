'use client';

import { useState } from 'react';
import { submitProofAction } from '@/actions/winners';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface ProofUploadFormProps {
  winnerId: string;
  currentProofUrl?: string | null;
  verificationStatus: string;
}

export function ProofUploadForm({
  winnerId,
  currentProofUrl,
  verificationStatus,
}: ProofUploadFormProps) {
  const [fileUrl, setFileUrl] = useState(
    currentProofUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) {
      setErrorMsg('Please enter or provide a proof screenshot URL');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('winnerId', winnerId);
    formData.append('fileUrl', fileUrl);

    const res = await submitProofAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Winning proof submitted for verification.');
    } else {
      setErrorMsg(res.error || 'Failed to submit proof');
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-white">
          Winning Score Proof Screenshot
        </CardTitle>
        <CardDescription className="text-xs">
          Provide a screenshot of your score or ticket to verify your prize claim.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Proof Image URL"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://..."
            helperText="Direct URL of your game result screenshot."
          />

          {fileUrl && (
            <div className="rounded border border-border bg-slate-900 p-2 overflow-hidden max-w-md">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1">
                Image Preview:
              </span>
              <img
                src={fileUrl}
                alt="Proof Preview"
                className="rounded max-h-48 w-full object-cover"
                onError={() => setErrorMsg('Could not load preview image URL')}
              />
            </div>
          )}

          {errorMsg && (
            <div className="rounded bg-rose-950/40 border border-rose-800 p-2.5 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded bg-emerald-950/40 border border-emerald-800 p-2.5 text-xs text-emerald-300">
              {successMsg}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={verificationStatus === 'APPROVED'}
          >
            {currentProofUrl ? 'Update Proof' : 'Submit Proof'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
