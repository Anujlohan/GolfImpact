import { CharityService } from '@/lib/services/charity.service';
import { CharitySelector } from '@/components/charity/CharitySelector';
import { requireAuth } from '@/lib/auth/guards';

export default async function CharityOnboardingPage() {
  const auth = await requireAuth();
  const charities = await CharityService.getCharities();
  const currentSelection = await CharityService.getUserCharitySelection(auth.userId);

  return (
    <div className="py-12 md:py-16 mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Select Charity Beneficiary
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirm your dedicated charity partner and minimum 10% pledge. You can adjust this anytime from your dashboard.
        </p>
      </div>

      <CharitySelector
        charities={charities}
        currentSelection={currentSelection}
        redirectAfterSave="/dashboard"
      />
    </div>
  );
}
