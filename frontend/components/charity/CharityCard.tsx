import Link from 'next/link';
import { Charity } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/currency';
import { DirectDonationModal } from './DirectDonationModal';

interface CharityCardProps {
  charity: Charity;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelectButton?: boolean;
}

export function CharityCard({
  charity,
  isSelected,
  onSelect,
  showSelectButton = false,
}: CharityCardProps) {
  return (
    <Card
      className={`overflow-hidden flex flex-col justify-between bg-card ${
        isSelected ? 'border-primary' : 'border-border'
      }`}
    >
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        <img
          src={charity.image_url}
          alt={charity.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className="text-[10px]">
            {charity.category}
          </Badge>
          {charity.is_featured && (
            <Badge variant="default" className="text-[10px]">
              Featured
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-white line-clamp-1">{charity.name}</CardTitle>
          {isSelected && (
            <Badge variant="default" className="text-[10px]">
              Selected
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2 text-xs text-muted-foreground mt-1">
          {charity.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3 pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Funds Raised:</span>
          <span className="font-semibold text-white font-mono">
            {formatCurrency(charity.total_raised || 0)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between gap-2 border-t border-border p-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/charities/${charity.id}`}
            className="text-xs text-muted-foreground hover:text-white underline"
          >
            Details
          </Link>
          <DirectDonationModal charityId={charity.id} charityName={charity.name} />
        </div>

        {showSelectButton && onSelect && (
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            onClick={onSelect}
            className="text-xs h-7"
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
