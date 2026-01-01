'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CoinsIcon } from 'lucide-react';

export function CreditBadge() {
  const user = useQuery(api.users.current);

  if (!user === undefined)
    return <Skeleton className="w-28 h-9 rounded-full" />;
  const credits = user?.credits ?? 0;

  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
      <CoinsIcon className="size-4" />
      <span>{credits} Credits</span>
    </div>
  );
}
