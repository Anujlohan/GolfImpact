'use client';

import { useState } from 'react';
import { Charity, CharitySelection } from '@/types/database';
import { setCharitySelectionAction } from '@/actions/charity';
import { CharityCard } from './CharityCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface CharitySelectorProps {
  charities: Charity[];
  currentSelection?: CharitySelection | null;
  onSaved?: () => void;
  redirectAfterSave?: string;
}

export function CharitySelector({
  charities,
  currentSelection,
  onSaved,
  redirectAfterSave,
}: CharitySelectorProps) {
  const [selectedCharityId, setSelectedCharityId] = useState<string>(
    currentSelection?.charity_id || charities[0]?.id || ''
  );
  const [percentage, setPercentage] = useState<number>(
    currentSelection?.contribution_percentage || 15
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCharity = charities.find((c) => c.id === selectedCharityId);

  const handleSave = async () => {
    if (!selectedCharityId) {
      setErrorMsg('Please select a charity.');
      return;
    }

    if (percentage < 10) {
      setErrorMsg('Minimum charity contribution is 10%.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('charityId', selectedCharityId);
    formData.append('contributionPercentage', percentage.toString());

    const res = await setCharitySelectionAction(formData);
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg(`Pledge of ${percentage}% to ${selectedCharity?.name} saved.`);
      if (redirectAfterSave) {
        window.location.href = redirectAfterSave;
      }
      if (onSaved) onSaved();
    } else {
      setErrorMsg(res.error || 'Failed to update charity selection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Percentage slider card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white">
            Set Your Impact Contribution (Min. 10%)
          </CardTitle>
          <CardDescription className="text-xs">
            Select the percentage of your lottery winnings automatically allocated to your chosen charity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pledge Percentage:</span>
              <span className="font-bold text-white text-lg">
                {percentage}%
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>10% (Minimum)</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="rounded border border-border bg-slate-900/60 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Example on $10,000 Win:</span>
              <div className="font-semibold text-white mt-0.5">
                Player keeps: ${(10000 * (100 - percentage) / 100).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Direct Grant to Cause:</span>
              <div className="font-semibold text-emerald-400 mt-0.5">
                Charity receives: ${(10000 * percentage / 100).toLocaleString()}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded bg-rose-950/40 border border-rose-800 p-2 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded bg-emerald-950/40 border border-emerald-800 p-2 text-xs text-emerald-300">
              {successMsg}
            </div>
          )}

          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className="w-full sm:w-auto"
          >
            Save Charity & {percentage}% Pledge
          </Button>
        </CardContent>
      </Card>

      {/* Select Cause from Catalog */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">
          Select Charity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((charity) => (
            <CharityCard
              key={charity.id}
              charity={charity}
              isSelected={charity.id === selectedCharityId}
              showSelectButton
              onSelect={() => setSelectedCharityId(charity.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
