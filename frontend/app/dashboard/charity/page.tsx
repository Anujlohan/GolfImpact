import { requireSubscriber } from '@/lib/auth/guards';
import { CharityService } from '@/lib/services/charity.service';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { CharitySelector } from '@/components/charity/CharitySelector';

export default async function DashboardCharityPage() {
  const auth = await requireSubscriber();
  const charities = await CharityService.getCharities();
  const currentSelection = await CharityService.getUserCharitySelection(auth.userId);

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <DashboardNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Charity Allocation
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure your dedicated partner charity and pledge percentage (minimum 10%).
            </p>
          </div>

          <CharitySelector
            charities={charities}
            currentSelection={currentSelection}
          />
        </div>
      </div>
    </div>
  );
}
