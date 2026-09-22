import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">404</div>
      <h1 className="text-lg font-bold text-white">Page Not Found</h1>
      <p className="max-w-md text-xs text-muted-foreground">
        The page or draw record you are looking for does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link href="/">
          <Button size="sm">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
