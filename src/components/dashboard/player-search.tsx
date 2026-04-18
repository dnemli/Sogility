import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerDashboardView } from "../../types/dashboard";

type PlayerSearchProps = {
  players: PlayerDashboardView[];
  selectedPlayerId: string;
  onSelectPlayer: (playerId: string) => void;
};

export function PlayerSearch({ players, selectedPlayerId, onSelectPlayer }: PlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.id.toLowerCase().includes(q));
  }, [players, query]);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Find player
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (blurTimer.current) {
              clearTimeout(blurTimer.current);
              blurTimer.current = null;
            }
            setOpen(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 180);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered[0]) {
              onSelectPlayer(filtered[0].id);
              setQuery("");
              setOpen(false);
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Search by name…"
          className="h-11 w-full rounded-2xl border border-slate-200/80 bg-white/90 pl-10 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="player-search-results"
        />
      </div>
      {open ? (
        <div
          id="player-search-results"
          className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white/95 py-1 shadow-sm"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No matching players.</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={p.id === selectedPlayerId}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectPlayer(p.id);
                  setQuery("");
                  setOpen(false);
                }}
                className={`flex w-full flex-col items-start px-4 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${
                  p.id === selectedPlayerId ? "bg-emerald-50/80 font-semibold text-emerald-900" : "text-slate-800"
                }`}
              >
                <span>{p.profile.playerName}</span>
                <span className="text-xs font-normal text-slate-500">
                  {p.profile.ageGroup} · {p.profile.gender}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
