import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerDashboardView } from "../../types/dashboard";

type PlayerSearchProps = {
  players: PlayerDashboardView[];
  selectedPlayerId: string;
  onSelectPlayer: (playerId: string) => void;
  mode?: "default" | "darkCompact";
};

export function PlayerSearch({
  players,
  selectedPlayerId,
  onSelectPlayer,
  mode = "default",
}: PlayerSearchProps) {
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
  const isDarkCompact = mode === "darkCompact";

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <label
        className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
          isDarkCompact ? "text-[#6A8090]" : "text-slate-500"
        }`}
      >
        Find player
      </label>
      <div className="relative">
        <Search
          className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
            isDarkCompact ? "text-[#6A8090]" : "text-slate-400"
          }`}
        />
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
          className={`h-11 w-full rounded-2xl pl-10 pr-4 text-sm font-medium shadow-sm outline-none transition ${
            isDarkCompact
              ? "border border-[#1E2D40] bg-[#0F2236] text-[#E0E8F0] focus:border-[#3ECF8E] focus:ring-2 focus:ring-[#3ECF8E]/20"
              : "border border-slate-200/80 bg-white/90 text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          }`}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="player-search-results"
        />
      </div>
      {open ? (
        <div
          id="player-search-results"
          className={`max-h-72 overflow-y-auto rounded-2xl py-1 shadow-sm ${
            isDarkCompact
              ? "border border-[#1E2D40] bg-[#131F2E]"
              : "border border-slate-200/80 bg-white/95"
          }`}
          role="listbox"
        >
          {filtered.length === 0 ? (
            <p className={`px-4 py-3 text-sm ${isDarkCompact ? "text-[#9AB0C0]" : "text-slate-500"}`}>
              No matching players.
            </p>
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
                className={`flex w-full flex-col items-start px-4 py-2.5 text-left text-sm transition ${
                  isDarkCompact ? "hover:bg-[#1E2D40]" : "hover:bg-emerald-50"
                } ${
                  p.id === selectedPlayerId
                    ? isDarkCompact
                      ? "bg-[#1E2D40] font-semibold text-[#3ECF8E]"
                      : "bg-emerald-50/80 font-semibold text-emerald-900"
                    : isDarkCompact
                      ? "text-[#E0E8F0]"
                      : "text-slate-800"
                }`}
              >
                <span>{p.profile.playerName}</span>
                <span className={`text-xs font-normal ${isDarkCompact ? "text-[#9AB0C0]" : "text-slate-500"}`}>
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
