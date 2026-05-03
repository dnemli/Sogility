import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { SurfaceCard } from "../ui/card";
import type { PlayerDashboardView, TrainerSavedAssessment } from "../../types/dashboard";
import {
  ASSESSMENT_CATEGORY_ORDER,
  drillsForCategoryAndEquipment,
  equipmentForCategory,
  type AssessmentCategory,
  type AssessmentDrill,
} from "../../data/assessment-config";
import { cn } from "../../lib/utils";

type TrainerNewAssessmentFormProps = {
  players: PlayerDashboardView[];
  /** When set, player is pre-filled; when undefined, trainer must pick a player. */
  presetPlayerId?: string;
  onSave: (saved: TrainerSavedAssessment) => void;
  onCancel: () => void;
};

const selectClass =
  "h-11 w-full rounded-xl border border-[#1E2D40] bg-[#0F2236] px-3 text-sm font-medium text-[#E0E8F0] outline-none disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6A8090]";

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TrainerNewAssessmentForm({
  players,
  presetPlayerId,
  onSave,
  onCancel,
}: TrainerNewAssessmentFormProps) {
  const [playerId, setPlayerId] = useState<string>(presetPlayerId ?? "");
  const [playerQuery, setPlayerQuery] = useState<string>("");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerActiveIdx, setPlayerActiveIdx] = useState(-1);
  const playerComboRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<AssessmentCategory | "">("");
  const [equipment, setEquipment] = useState<string>("");
  const [drillId, setDrillId] = useState<string>("");
  const [rawScoreInput, setRawScoreInput] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [timestamp, setTimestamp] = useState<Date>(() => new Date());

  useEffect(() => {
    setTimestamp(new Date());
  }, []);

  useEffect(() => {
    if (presetPlayerId) setPlayerId(presetPlayerId);
  }, [presetPlayerId]);

  const equipmentOptions = useMemo(
    () => (category ? equipmentForCategory(category as AssessmentCategory) : []),
    [category],
  );

  const drillOptions = useMemo(() => {
    if (!category || !equipment) return [];
    return drillsForCategoryAndEquipment(category as AssessmentCategory, equipment);
  }, [category, equipment]);

  const selectedDrill: AssessmentDrill | undefined = useMemo(() => {
    if (!drillId) return undefined;
    return drillOptions.find((d) => d.id === drillId);
  }, [drillId, drillOptions]);

  const handleCategoryChange = (next: AssessmentCategory | "") => {
    setCategory(next);
    setEquipment("");
    setDrillId("");
  };

  const handleEquipmentChange = (next: string) => {
    setEquipment(next);
    setDrillId("");
  };

  const scoreMeta = selectedDrill?.scoreUnit;

  const rawScoreParsed = (): number | null => {
    const t = rawScoreInput.trim();
    if (t === "") return null;
    const n = Number.parseFloat(t);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  const validateScore = (n: number): string | null => {
    if (scoreMeta === "/8") {
      if (!Number.isInteger(n) || n < 0 || n > 8) return "Enter a whole number from 0 to 8.";
      return null;
    }
    if (scoreMeta === "sec") {
      if (n <= 0) return "Enter a positive time in seconds.";
      return null;
    }
    return null;
  };

  const selectedPlayer = players.find((p) => p.id === playerId);
  const filteredPlayers = useMemo(() => {
    const q = playerQuery.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.profile.playerName.toLowerCase().includes(q));
  }, [players, playerQuery]);

  useEffect(() => {
    setPlayerActiveIdx(-1);
  }, [playerQuery]);

  useEffect(() => {
    const close = (ev: MouseEvent | TouchEvent) => {
      const el = playerComboRef.current;
      if (!el || !(ev.target instanceof Node)) return;
      if (!el.contains(ev.target)) setPlayerOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, []);

  const choosePlayer = (p: PlayerDashboardView) => {
    setPlayerId(p.id);
    setPlayerQuery(p.profile.playerName);
    setPlayerOpen(false);
    setPlayerActiveIdx(-1);
  };

  const onPlayerSearchChange = (next: string) => {
    setPlayerQuery(next);
    setPlayerOpen(true);
    const sel = players.find((x) => x.id === playerId);
    if (sel && sel.profile.playerName.trim().toLowerCase() !== next.trim().toLowerCase()) {
      setPlayerId("");
    }
  };

  const canSave =
    Boolean(playerId) &&
    Boolean(selectedDrill) &&
    rawScoreParsed() !== null &&
    validateScore(rawScoreParsed()!) === null;

  const handleSave = () => {
    if (!selectedDrill || !playerId) return;
    const raw = rawScoreParsed();
    if (raw === null) return;
    const err = validateScore(raw);
    if (err) return;

    const ts = new Date();
    setTimestamp(ts);

    const saved: TrainerSavedAssessment = {
      id: `trainer-${ts.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
      playerId,
      category: selectedDrill.category,
      equipment: selectedDrill.equipment,
      assessmentName: selectedDrill.assessmentName,
      skillFocus: selectedDrill.skillFocus,
      description: selectedDrill.description,
      duration: selectedDrill.duration,
      rawScore: raw,
      scoreUnit: selectedDrill.scoreUnit,
      timestamp: ts.toISOString(),
      notes: notes.trim() || undefined,
      drillId: selectedDrill.id,
    };
    onSave(saved);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1E2D40] bg-[#131F2E] px-3 py-2 text-sm font-semibold text-[#9AB0C0] hover:text-[#E0E8F0] sm:w-fit sm:justify-start"
      >
        <ArrowLeft size={16} />
        Cancel
      </button>

      <SurfaceCard className="space-y-4">
        <div>
          <p className={labelClass}>New assessment</p>
          <h2 className="mt-1 text-lg font-semibold text-[#E0E8F0]">Record assessment</h2>
        </div>

        {/* 1 Player */}
        <div className="space-y-2">
          <label className={labelClass} htmlFor="na-player">
            Player
          </label>
          {presetPlayerId && selectedPlayer ? (
            <div className="rounded-xl border border-[#1E2D40] bg-[#102136] px-3 py-3">
              <p className="text-base font-semibold text-[#E0E8F0]">{selectedPlayer.profile.playerName}</p>
              <p className="mt-1 text-xs text-[#9AB0C0]">
                Pre-selected from player profile — use Cancel to leave.
              </p>
            </div>
          ) : (
            <>
              <div ref={playerComboRef} className="relative">
                <div className="relative">
                  <input
                    id="na-player"
                    type="text"
                    role="combobox"
                    aria-expanded={playerOpen}
                    aria-controls="na-player-listbox"
                    aria-autocomplete="list"
                    aria-activedescendant={
                      playerOpen && playerActiveIdx >= 0 && filteredPlayers[playerActiveIdx]
                        ? `na-player-opt-${filteredPlayers[playerActiveIdx]!.id}`
                        : undefined
                    }
                    value={playerQuery}
                    onChange={(e) => onPlayerSearchChange(e.target.value)}
                    onFocus={() => setPlayerOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setPlayerOpen(false);
                        return;
                      }
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setPlayerOpen(true);
                        setPlayerActiveIdx((i) => {
                          const max = filteredPlayers.length - 1;
                          if (max < 0) return -1;
                          return i < 0 ? 0 : Math.min(i + 1, max);
                        });
                        return;
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setPlayerActiveIdx((i) => {
                          const max = filteredPlayers.length - 1;
                          if (max < 0) return -1;
                          if (i < 0) return max;
                          return Math.max(i - 1, 0);
                        });
                        return;
                      }
                      if (e.key === "Enter") {
                        if (playerOpen && playerActiveIdx >= 0) {
                          const p = filteredPlayers[playerActiveIdx];
                          if (p) {
                            e.preventDefault();
                            choosePlayer(p);
                          }
                        }
                      }
                    }}
                    placeholder="Type or choose a player…"
                    autoComplete="off"
                    className={cn(selectClass, "cursor-text pr-10")}
                  />
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6A8090]"
                    aria-hidden
                  />
                </div>
                {playerOpen ? (
                  <ul
                    id="na-player-listbox"
                    role="listbox"
                    className="absolute left-0 right-0 z-50 mt-1 max-h-56 list-none overflow-auto rounded-xl border border-[#1E2D40] bg-[#0F2236] py-1 shadow-lg"
                  >
                    {filteredPlayers.length === 0 ? (
                      <li className="list-none px-3 py-2.5 text-sm text-[#6A8090]" aria-live="polite">
                        No players match “{playerQuery.trim() || "…"}”.
                      </li>
                    ) : (
                      filteredPlayers.map((p, i) => (
                        <li
                          key={p.id}
                          id={`na-player-opt-${p.id}`}
                          role="option"
                          aria-selected={playerId === p.id}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm font-medium text-[#E0E8F0] hover:bg-[#131F2E]",
                            i === playerActiveIdx ? "bg-[#131F2E]" : "",
                            playerId === p.id ? "text-[#3ECF8E]" : "",
                          )}
                          onMouseEnter={() => setPlayerActiveIdx(i)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            choosePlayer(p);
                          }}
                        >
                          {p.profile.playerName}
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </div>
              <p className="text-xs text-[#9AB0C0]">
                Type to filter players; click a row or use arrow keys and Enter.
              </p>
            </>
          )}
        </div>

        {/* 2 Category */}
        <div className="space-y-2">
          <label className={labelClass} htmlFor="na-category">
            Category
          </label>
          <select
            id="na-category"
            value={category}
            onChange={(e) => handleCategoryChange((e.target.value || "") as AssessmentCategory | "")}
            className={selectClass}
          >
            <option value="">Select category…</option>
            {ASSESSMENT_CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 3 Equipment */}
        <div className="space-y-2">
          <label className={labelClass} htmlFor="na-equipment">
            Equipment
          </label>
          <select
            id="na-equipment"
            value={equipment}
            onChange={(e) => handleEquipmentChange(e.target.value)}
            disabled={!category}
            className={selectClass}
          >
            <option value="">{category ? "Select equipment…" : "Select category first"}</option>
            {equipmentOptions.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        {/* 4 Drill */}
        <div className="space-y-2">
          <label className={labelClass} htmlFor="na-drill">
            Drill / assessment name
          </label>
          <select
            id="na-drill"
            value={drillId}
            onChange={(e) => setDrillId(e.target.value)}
            disabled={!equipment}
            className={selectClass}
          >
            <option value="">{equipment ? "Select drill…" : "Select equipment first"}</option>
            {drillOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.assessmentName}
              </option>
            ))}
          </select>
        </div>

        {/* 5–7 Auto */}
        <div className="space-y-3 rounded-xl border border-[#1E2D40] bg-[#102136] p-3">
          <div>
            <p className={labelClass}>Duration</p>
            <p className="mt-1 text-sm text-[#E0E8F0]">{selectedDrill?.duration ?? "—"}</p>
          </div>
          <div>
            <p className={labelClass}>Skill focus</p>
            <p className="mt-1 text-sm text-[#E0E8F0]">{selectedDrill?.skillFocus ?? "—"}</p>
          </div>
          <div>
            <p className={labelClass}>Assessment description</p>
            <p className="mt-1 text-sm leading-relaxed text-[#9AB0C0]">{selectedDrill?.description ?? "—"}</p>
          </div>
        </div>

        {/* 8 Score */}
        <div className="space-y-2">
          <label className={labelClass} htmlFor="na-score">
            {scoreMeta === "sec" ? "Time (sec)" : scoreMeta === "/8" ? "Score out of 8" : "Score"}
          </label>
          <input
            id="na-score"
            type={scoreMeta === "/8" ? "number" : "text"}
            inputMode="decimal"
            min={scoreMeta === "/8" ? 0 : undefined}
            max={scoreMeta === "/8" ? 8 : undefined}
            step={scoreMeta === "/8" ? 1 : "any"}
            value={rawScoreInput}
            onChange={(e) => setRawScoreInput(e.target.value)}
            placeholder={scoreMeta === "sec" ? "e.g. 4.52" : scoreMeta === "/8" ? "0–8" : "e.g. 12"}
            className="h-11 w-full rounded-xl border border-[#1E2D40] bg-[#0F2236] px-3 text-sm font-medium text-[#E0E8F0] outline-none placeholder:text-[#6A8090]"
          />
        </div>

        {/* 9 Timestamp */}
        <div className="space-y-2">
          <p className={labelClass}>Timestamp</p>
          <p className="rounded-xl border border-[#1E2D40] bg-[#0F2236] px-3 py-2 text-sm text-[#E0E8F0]">
            {formatTimestamp(timestamp)}
          </p>
        </div>

        {/* 10 Notes */}
        <div className="space-y-2">
          <label className={labelClass} htmlFor="na-notes">
            Notes (optional)
          </label>
          <textarea
            id="na-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-xl border border-[#1E2D40] bg-[#0F2236] px-3 py-2 text-sm text-[#E0E8F0] outline-none placeholder:text-[#6A8090]"
            placeholder="Session notes…"
          />
        </div>

        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className={cn(
            "h-11 w-full rounded-2xl text-sm font-semibold text-[#0F1923]",
            canSave ? "bg-[#3ECF8E]" : "cursor-not-allowed bg-[#1E2D40] text-[#6A8090]",
          )}
        >
          Save Assessment
        </button>
      </SurfaceCard>
    </div>
  );
}
