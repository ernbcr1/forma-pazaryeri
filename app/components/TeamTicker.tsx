export default function TeamTicker() {
  const teams = [
    "Real Madrid",
    "Barcelona",
    "Manchester United",
    "Liverpool",
    "Arsenal",
    "Chelsea",
    "Manchester City",
    "Tottenham",
    "Milan",
    "Inter",
    "Juventus",
    "Napoli",
    "Bayern Münih",
    "Borussia Dortmund",
    "PSG",
    "Marseille",
    "Galatasaray",
    "Fenerbahçe",
    "Beşiktaş",
    "Trabzonspor",
    "Southampton",
  ];

  const tickerText = [...teams, ...teams];

  return (
    <div className="relative w-full overflow-hidden border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 md:px-8">
        <div className="shrink-0 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[11px] font-bold text-neutral-400">
          elF
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-6 whitespace-nowrap text-xs font-semibold text-neutral-500">
            {tickerText.map((team, index) => (
              <span key={`${team}-${index}`} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                {team}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}