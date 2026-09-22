export function RollingScoreNotice({ currentCount }: { currentCount: number }) {
  return (
    <div className="rounded border border-border bg-card p-4 text-xs text-muted-foreground space-y-1">
      <div className="font-semibold text-white">
        Score Limit: {currentCount} of 5 slots used
      </div>
      <p className="leading-relaxed">
        The system records your 5 most recent scores. When inserting a 6th score, your oldest score by date is automatically pruned.
      </p>
    </div>
  );
}
