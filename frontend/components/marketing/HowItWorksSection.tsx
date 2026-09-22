const steps = [
  {
    step: '01',
    title: 'Subscribe',
    description:
      'Choose a monthly ($15) or annual ($144) pass to enter upcoming monthly jackpot pools.',
  },
  {
    step: '02',
    title: 'Select Charity',
    description:
      'Pick a verified charity partner and confirm your minimum 10% pledge on any prize won.',
  },
  {
    step: '03',
    title: 'Submit 5 Scores',
    description:
      'Log daily game scores between 1 and 45. The system maintains your 5 most recent scores.',
  },
  {
    step: '04',
    title: 'Monthly Draw & Payouts',
    description:
      'Draws run monthly with 40% (5-match), 35% (4-match), and 25% (3-match) prize allocations.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-12 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-xs text-muted-foreground">
            A simple 4-step process from score entry to charity grant distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500">
                {s.step}
              </div>
              <h3 className="text-sm font-semibold text-white">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
