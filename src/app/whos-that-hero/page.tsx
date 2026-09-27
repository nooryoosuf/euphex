"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG, IMAGES, allHero, ALL_HERO_SLUGS } from "@/data/imagery";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const disp = (slug: string) => allHero(slug)?.name ?? slug;
const normLane = (l: string) => (l.toLowerCase().startsWith("exp") ? "exp" : l.toLowerCase());
const POINTS = [1000, 700, 450, 250, 100];
const MAX_GUESSES = 5;

function dayNum(d = new Date()) {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
function seededPick(n: number, salt = 11) {
  let h = (n * 2654435761 + salt * 40503) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  return h;
}

interface DayResult {
  won: boolean;
  guesses: string[];
  points: number;
}
interface Stats {
  played: number;
  won: number;
  streak: number;
  best: number;
  total: number;
  guessSum: number;
}

const dayKey = (d: number) => `euphex-kit-${d}`;
const STATS_KEY = "euphex-kit-stats";

function loadStats(): Stats {
  try {
    return { played: 0, won: 0, streak: 0, best: 0, total: 0, guessSum: 0, ...JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}") };
  } catch {
    return { played: 0, won: 0, streak: 0, best: 0, total: 0, guessSum: 0 };
  }
}

function Tile({ label, state, arrow }: { label: string; state: "hit" | "close" | "miss" | "arrow"; arrow?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-bold tracking-[0.1em]",
        state === "hit" && "border-emerald-400/60 bg-emerald-400/15 text-emerald-200",
        state === "close" && "border-amber-300/60 bg-amber-300/10 text-amber-200",
        (state === "miss" || state === "arrow") && "border-white/15 bg-white/5 text-white/60",
      )}
      title={state === "hit" ? "Match" : state === "close" ? "Partial" : state === "arrow" ? "Higher / lower" : "No match"}
    >
      {label} {arrow && <span aria-hidden="true">{arrow}</span>}
    </span>
  );
}

export default function KitCheckPage() {
  const pool = useMemo(() => ALL_HERO_SLUGS, []);
  const today = dayNum();
  const target = pool[seededPick(today) % pool.length];
  const puzzleNo = today - dayNum(new Date(2026, 8, 27)) + 1;

  const [practice, setPractice] = useState(false);
  const [pTarget, setPTarget] = useState(() => pool[seededPick(today, 99) % pool.length]);
  const readDay = (): DayResult | null => {
    try {
      const s = localStorage.getItem(dayKey(today));
      return s ? (JSON.parse(s) as DayResult) : null;
    } catch {
      return null;
    }
  };
  const [guesses, setGuesses] = useState<string[]>(() => readDay()?.guesses ?? []);
  const [pGuesses, setPGuesses] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [done, setDone] = useState<DayResult | null>(readDay);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const activeTarget = practice ? pTarget : target;
  const activeGuesses = practice ? pGuesses : guesses;
  const won = activeGuesses.includes(activeTarget);
  const lost = !won && activeGuesses.length >= MAX_GUESSES;
  const over = won || lost;
  // second riddle unlocks after the 2nd miss
  const riddleCount = activeGuesses.length >= 2 ? 2 : 1;

  /** Wordle-style feedback for a guess vs the mystery hero. */
  const feedback = (slug: string) => {
    const g = allHero(slug);
    const t = allHero(activeTarget);
    const gl = (g?.lanes ?? []).map(normLane);
    const tl = (t?.lanes ?? []).map(normLane);
    const lane: "hit" | "close" | "miss" =
      !gl.length || !tl.length
        ? "miss"
        : gl.some((l) => tl.includes(l))
          ? gl.length === tl.length && tl.every((l) => gl.includes(l))
            ? "hit"
            : "close"
          : "miss";
    const cmp = (a?: number | null, b?: number | null, tol = 0) => {
      if (a == null || b == null) return "miss" as const;
      if (Math.abs(a - b) <= tol) return "hit" as const;
      return a > b ? ("high" as const) : ("low" as const);
    };
    return {
      lane,
      dif: cmp(g?.difficulty, t?.difficulty),
      wr: cmp(g?.meta?.winRate, t?.meta?.winRate, 0.5),
      difV: g?.difficulty ?? null,
      wrV: g?.meta?.winRate ?? null,
    };
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [today]);

  const guess = (slug: string) => {
    if (!practice) {
      if (over || activeGuesses.includes(slug)) return;
      const next = [...activeGuesses, slug];
      setGuesses(next);
      setQ("");
      if (slug === target || next.length >= MAX_GUESSES) {
      const win = slug === target;
      const pts = win ? POINTS[next.length - 1] : 0;
      const res: DayResult = { won: win, guesses: next, points: pts };
      setDone(res);
      try {
        localStorage.setItem(dayKey(today), JSON.stringify(res));
        const s = loadStats();
        const ns: Stats = {
          played: s.played + 1,
          won: s.won + (win ? 1 : 0),
          streak: win ? s.streak + 1 : 0,
          best: Math.max(s.best, win ? s.streak + 1 : s.streak),
          total: s.total + pts,
          guessSum: s.guessSum + (win ? next.length : 0),
        };
        localStorage.setItem(STATS_KEY, JSON.stringify(ns));
        setStats(ns);
      } catch { /* ignore */ }
      }
      return;
    }
    // practice: a guess after a finished round auto-deals a fresh hero
    let tgt = pTarget;
    let board = pGuesses;
    if (won || lost) {
      tgt = pool[seededPick(Date.now() % 100000, 5) % pool.length];
      setPTarget(tgt);
      board = [];
    }
    if (board.includes(slug)) return;
    setPGuesses([...board, slug]);
    setQ("");
  };

  const options = pool.filter((s) => disp(s).toLowerCase().includes(q.toLowerCase()) && !activeGuesses.includes(s)).slice(0, 8);

  const share = async () => {
    if (!done) return;
    const grid = done.guesses.map((g) => (g === target ? "🟩" : "🟥")).join("");
    const pad = Array.from({ length: MAX_GUESSES - done.guesses.length }).map(() => "⬛").join("");
    const text = `EUPHEX WHO'S THAT HERO #${puzzleNo} — ${done.won ? `${done.guesses.length}/5` : "X/5"} ${grid}${pad} (${done.points} pts) euphex.gg/whos-that-hero`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msLeft = Math.max(0, midnight.getTime() - now);
  const hh = String(Math.floor(msLeft / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((msLeft % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((msLeft % 60000) / 1000)).padStart(2, "0");

  const locked = !practice && done;

  return (
    <>
      <PageHero
        index="14"
        label="Fan zone"
        title="WHO'S THAT HERO?"
        sub="Two riddles, cold stat tiles, zero Google mercy. Name the hero in 5 guesses — new mystery daily."
        image={IMAGES.cecilion}
      />
      <div className="mx-auto max-w-[760px] px-5 md:px-10 py-12 md:py-16">
        {/* mode + stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="tablist" aria-label="Mode">
            {([["daily", "DAILY"], ["practice", "PRACTICE"]] as const).map(([m, label]) => (
              <button
                key={m}
                role="tab"
                aria-selected={(m === "practice") === practice}
                onClick={() => {
                  const toPractice = m === "practice";
                  setPractice(toPractice);
                  if (!toPractice && done) setGuesses(done.guesses);
                }}
                className={cn(
                  "px-4 py-2 text-[12px] font-bold tracking-[0.16em] uppercase cursor-pointer transition-all",
                  (m === "practice") === practice ? "bg-[var(--accent)] text-white" : "border border-white/12 text-white/55 hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="label text-white/40" role="status">
            {practice ? "Unscored practice" : `Puzzle #${puzzleNo} · ${stats.streak} streak · ${stats.total} pts`}
          </p>
        </div>

        {/* clue board */}
        <div className="grain relative mt-6 overflow-hidden border border-white/10 bg-[#0C0F16] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Mystery hero</Badge>
            <Badge>{activeGuesses.length}/{MAX_GUESSES} guesses</Badge>
            {!practice && done && <Badge tone={done.won ? "win" : "loss"}>{done.won ? `${done.points} PTS` : "FAILED"}</Badge>}
          </div>
          {/* cryptic riddles — un-Googleable by design */}
          <div className="mt-5 space-y-2.5 min-h-[150px]">
            <AnimatePresence>
              {RIDDLES[activeTarget].slice(0, riddleCount).map((r, i) => (
                <motion.blockquote
                  key={`${activeTarget}-${i}`}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border-l-2 border-[var(--accent)] pl-4 font-display text-lg md:text-xl font-medium italic text-white/85"
                >
                  “{r}”
                </motion.blockquote>
              ))}
            </AnimatePresence>
            <p className="text-xs text-white/35">
              {riddleCount < 2 ? "Miss twice to unlock the second riddle." : "Both riddles revealed. The tiles below are your only other clues."}
            </p>
          </div>

          {/* guesses with Wordle-style stat feedback */}
          <div className="mt-5 space-y-2" aria-live="polite">
            {activeGuesses.map((g, i) => {
              const fb = feedback(g);
              const hit = g === activeTarget;
              return (
                <div
                  key={`${g}-${i}`}
                  className={cn(
                    "flex flex-wrap items-center gap-2 border px-3 py-2",
                    hit ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-black/30",
                  )}
                >
                  <span className="font-display text-base font-bold min-w-[110px]">
                    {hit ? "🟩 " : "🟥 "}{disp(g)}
                  </span>
                  <Tile label="LANE" state={fb.lane} />
                  <Tile label={`DIF ${fb.difV ?? "?"}`} state={fb.dif === "hit" ? "hit" : fb.dif === "miss" ? "miss" : "arrow"} arrow={fb.dif === "high" ? "▲" : fb.dif === "low" ? "▼" : "="} />
                  <Tile label={`WR ${fb.wrV ?? "?"}%`} state={fb.wr === "hit" ? "hit" : fb.wr === "miss" ? "miss" : "arrow"} arrow={fb.wr === "high" ? "▲" : fb.wr === "low" ? "▼" : "="} />
                </div>
              );
            })}
            {activeGuesses.length === 0 && <p className="text-sm text-white/35">No guesses yet — the first riddle is free.</p>}
          </div>

          {/* resolution */}
          {over && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 border-t border-white/10 pt-6 text-center">
              {won ? (
                <>
                  <p className="label text-emerald-300">Solved in {activeGuesses.length}/{MAX_GUESSES}</p>
                  <p className="font-display mt-2 text-5xl font-bold">{disp(activeTarget).toUpperCase()}</p>
                  {!practice && <p className="font-display mt-1 text-2xl font-bold text-[var(--accent)] tabular-nums">+{POINTS[activeGuesses.length - 1]} PTS</p>}
                </>
              ) : (
                <>
                  <p className="label text-red-300">Out of guesses</p>
                  <p className="font-display mt-2 text-5xl font-bold">IT WAS {disp(activeTarget).toUpperCase()}</p>
                </>
              )}
              {!practice && done && (
                <button onClick={share} className="mt-5 border border-white/15 px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] cursor-pointer">
                  {copied ? "Copied ✓" : "Copy result grid"}
                </button>
              )}
              {practice && (
                <button
                  onClick={() => {
                    setPTarget(pool[seededPick(Date.now() % 100000, 5) % pool.length]);
                    setPGuesses([]);
                    setQ("");
                  }}
                  className="mt-5 border border-white/15 px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] cursor-pointer"
                >
                  New practice hero →
                </button>
              )}
            </motion.div>
          )}
          {!practice && locked && !over && (
            <p className="mt-5 text-center text-sm text-white/50">
              Today&apos;s puzzle is complete — next one in <span className="tabular-nums font-bold text-white">{hh}:{mm}:{ss}</span>. Practice mode is open above.
            </p>
          )}
        </div>

        {/* guess input — outside the clipped arena so the dropdown breathes.
            In practice it never locks: guessing after a finished round auto-deals a new hero. */}
        {(!over || practice) && !locked && (
          <div className="relative mt-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type a hero name…"
              aria-label="Guess the hero"
              className="w-full border border-white/12 bg-[#0C0F16] px-4 py-4 text-base placeholder:text-white/30 focus:outline-none focus:border-[var(--accent)]"
            />
            {q && options.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto border border-white/15 bg-[#0C0F16] shadow-[0_18px_50px_rgba(0,0,0,0.6)]" role="listbox" aria-label="Hero suggestions">
                  {options.map((s) => {
                    const meta = allHero(s);
                  return (
                    <li key={s}>
                      <button
                        onClick={() => guess(s)}
                        role="option"
                        aria-selected="false"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--accent)]/15 cursor-pointer"
                      >
                        {meta?.icon && <img src={meta.icon} alt="" aria-hidden="true" className="size-8 rounded-full object-cover" />}
                        <span className="font-bold">{disp(s)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* personal board */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-white/8 py-6">
          {[
            [String(stats.total), "Total pts"],
            [String(stats.streak), "Streak"],
            [String(stats.best), "Best streak"],
            [stats.won ? `${(stats.guessSum / stats.won).toFixed(1)}` : "—", "Avg guesses"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-bold tabular-nums">{v}</p>
              <p className="label mt-1 text-white/40">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-white/35">
          Daily hero · 5 guesses · points 1000 → 100. Your board lives in this browser — the global ladder arrives with the next upgrade.
        </p>
      </div>
    </>
  );
}

// hand-written cryptic clues — no names, no skill names, un-Googleable.
// riddle[0] is free; riddle[1] unlocks after the 2nd miss.
const RIDDLES: Record<string, [string, string]> = {
  fanny: ["My cables have more frequent-flyer miles than your account.", "Energy is a resource. Mine is a countdown."],
  ling: ["Four blades, thirty walls, zero patience.", "The blue buff pays rent and I collect."],
  hayabusa: ["My shadows do the work. I take the credit.", "One of me leaves. Four of me arrive."],
  joy: ["Miss a beat and the concert is over.", "Rhythm is damage. Arrhythmia is death."],
  lancelot: ["Thorns before roses. Always.", "I poke like a gentleman and leave like a thief."],
  aamon: ["You never saw me. The scoreboard did.", "Camouflage is confidence you can't see."],
  gusion: ["Ten daggers, one sentence.", "Blink and the backline is gone. Blink twice and so am I."],
  valentina: ["Your ult is my ult. I'm just borrowing it forever.", "Why master one skill when I can rent five?"],
  pharsa: ["Death from downtown, signed with feathers.", "My bird sees you. So do my bombs."],
  yve: ["The stars aligned. You didn't.", "Stand in my galaxy and regret it slowly."],
  cecilion: ["Every minute I farm, your odds evaporate.", "Bats now, apologies never."],
  "luo-yi": ["Yin, yang, and your whole team somewhere else.", "My portals have a refund policy. Nobody survives to use it."],
  aurora: ["Winter came early this year. So did your defeat.", "Frozen solid, farmed never."],
  kagura: ["My umbrella returns. Your teammates won't.", "Seventeen ways to delete you. I use three."],
  nana: ["Kill me once, shame on you. My second life disagrees.", "My pet makes decisions. Better ones than yours."],
  xavier: ["Infinite light, finite mercy.", "My cage has no door. Neither does your fate."],
  hirara: ["Gilded everything. Golden nothing.", "New shine, same funeral."],
  beatrix: ["Four guns, zero patience, infinite damage.", "Pick your caliber. I'll pick your grave."],
  claude: ["Me and my monkey versus your whole plan.", "Spin to win. Legislators hate him."],
  brody: ["Four stacks. One verdict.", "Charge it up. Regret it down."],
  melissa: ["My doll watches. You lose.", "Untargetable, unbothered, undefeated (allegedly)."],
  layla: ["Range is a lifestyle. So is dying.", "The longer the game, the longer my barrel."],
  lesley: ["One shot from nowhere. Goodbye.", "Camouflage is my love language. Sniping is my apology."],
  "yu-zhong": ["The dragon doesn't knock.", "Petrify first, questions never."],
  terizla: ["Three hammers. Zero survivors.", "My ult has a postcode. You're in it."],
  paquito: ["Jab, jab, uppercut, obituary.", "Champion stance. Chump results — yours."],
  "lapu-lapu": ["Two blades, one burial.", "Brave stance. Your funeral, my highlight."],
  badang: ["Walls are suggestions. Fists are conclusions.", "My fists file noise complaints."],
  belerick: ["Hit me. I dare you. I insist.", "A tree that fights back and wins."],
  benedetta: ["Blink and you'll miss me. Don't blink and you'll miss me anyway.", "Immune to everything except criticism. And you."],
  estes: ["Moonlight heals. Moonlight judges.", "My team lives because I say so."],
  franco: ["Come here. No, closer. Perfect.", "One hook. One funeral. Zero regrets (mine)."],
  chou: ["One kick. New postcode.", "Immune to CC. Immune to mercy."],
  khufra: ["Bouncing ball of no-escape.", "Dash into me. I insist."],
  mathilda: ["Hop on. We're going down together.", "My wisps guide. Your HP decides."],
  atlas: ["Dragged into the deep, politely.", "Chains for everyone. Mercy for none."],
  angela: ["I'll possess your carry and your composure.", "Attached at the hip. Detached from mercy."],
  johnson: ["Beep beep. Your lane is closed.", "Four seats. One destination: your base."],
  natalia: ["Shhh. You were never here.", "Silence is golden. Yours is permanent."],
  "popol-and-kupa": ["The dog fights. I supervise.", "Traps everywhere. Shame about the aim."],
  akai: ["Hug the wall. Now hug the dirt.", "Panda express — delivering you to my team."],
  aldous: ["Five hundred stacks. Zero mercy. Eventually.", "I ult across the map. You should've recalled yesterday."],
  alice: ["Your HP is my HP. Thanks for sharing.", "Balls of doom, bouncing since 2016."],
  alpha: ["Me and Beta versus your whole existence.", "Lock on. Blast off. Repeat."],
  alucard: ["Ten and zero, or zero and ten. No middle.", "Lifesteal is a lifestyle. Dying is a habit."],
  argus: ["Kill me once. I dare you. Try twice.", "Eternal evil, temporary teammates."],
  arlott: ["Stare into my eyes. Now stare at the grey screen.", "Your backline called. It's gone."],
  aulus: ["Axe first, questions in the next patch.", "Late game is my timezone."],
  balmond: ["Spin to maybe-win.", "Execute threshold: your dignity."],
  bane: ["Shark attack, rum included.", "My cannon needs no permission."],
  barats: ["Me big. You small. Math checks out.", "Dino-mite damage, dino-sized appetite."],
  baxia: ["Rolling in like your ranked downfall.", "Anti-heal on wheels."],
  bruno: ["Ball's life. Your death.", "Crits so loud the neighbors complain."],
  carmilla: ["Bleed with me. It's couples' night.", "Bats, blood, and bad decisions — yours."],
  "chang-e": ["Meteor shower, feelings hurt.", "Bunny DPS. Fear the fluff."],
  chip: ["Portal logistics. Your base, my schedule.", "New portals, same screaming."],
  cici: ["Yoyo diplomacy has failed. Violence it is.", "Bouncy, bubbly, brutal."],
  clint: ["Six chambers, zero witnesses — all of them you.", "Blind first, apologize never."],
  cyclops: ["Tiny mage, planetary ego.", "Stars align. You fall."],
  diggie: ["Owl's wisdom, egg's courage.", "Time bomb with feathers."],
  dori: ["Too new for your tier list. Already better than you.", "Fresh paint. Same funeral."],
  dyrroth: ["Abyss called. It wants you back.", "Second skill: deleting your HP bar."],
  edith: ["Tank by day, artillery by mood.", "Primal Wrath, primal disappointment — yours."],
  esmeralda: ["Your shields are my shields now.", "Frost and moonlight. Mostly frostbite."],
  eudora: ["Point, click, obituary.", "Thunderstruck, truck-struck, same thing."],
  faramis: ["Death is a suggestion. I declined.", "Cult classic. Literally a cult."],
  floryn: ["Lantern lit. Hopes dimmed — yours.", "Bloom where you're planted. I'll bloom over your grave."],
  fredrinn: ["Sword, shield, and your last mistake.", "Combo counter: rising. Your chances: falling."],
  freya: ["Valkyrie descent. Your ascent: cancelled.", "Leap of faith, landing of doom."],
  gatotkaca: ["Iron fists, concrete results — for me.", "Taunt first. Survivors: none."],
  gloo: ["Sticky situation? You're the situation.", "Split up. It's worse for you split."],
  gord: ["Laser-focused. On the wrong target.", "Mystic beams, mystical misses."],
  granger: ["Six bullets. Five for you, one for the tank.", "Death sonata in a minor key."],
  grock: ["Walls fear me. So should you.", "Nature's guardian, your executioner."],
  guinevere: ["Leap of faith, landing of felony.", "Magic crown, criminal damage."],
  hanabi: ["Petals fall. So do you.", "Sealed fate, opened grave."],
  hanzo: ["My body meditates. My demon eliminates.", "Two places at once. Zero mercy in both."],
  harith: ["Dash decay: yours. Dash display: mine.", "Time is money. You're bankrupt."],
  harley: ["Cards dealt. You're holding nothing.", "Poker trick, forty thieves of HP."],
  helcurt: ["Lights out. Everyone's dead — starting with you.", "Silence has teeth."],
  hilda: ["Bush ownership: mine. Deed included.", "Regen queen. Your damage is rent-free."],
  hylos: ["Horsepower with a grudge.", "The pathway is glorious. Your fate isn't."],
  irithel: ["Ride-by shooting, legally distinct.", "My lion aims. I just vibe."],
  ixia: ["Guns blazing, cases closed.", "New gunslinger. Same old grave."],
  jawhead: ["Yeet first, apologize in the next update.", "Missiles loaded. Manners uninstalled."],
  julian: ["Sword, scythe, and your funeral — enhanced.", "Three weapons. Zero survivors."],
  kadita: ["Tide's out. So are you.", "Ocean's ode to your defeat."],
  kaja: ["Divine judgment, delivered personally.", "One pull. One departure."],
  kalea: ["Tidecaller, grave-maker.", "New waves. Same drowning."],
  karina: ["Dance of death, encore never.", "True damage, truly over."],
  karrie: ["Wheels up. HP down — yours.", "Spin class is in session. Permanently."],
  khaleed: ["Sandstorm season. You're the debris.", "Desert power. Oasis of pain — for you."],
  kimmy: ["Aim with movement. Miss with style.", "Spray and pray, mostly pray — yours."],
  leomord: ["Horse armor, heartbreaker.", "Charge now. Regret instantly — you."],
  lolita: ["Shield up. Hopes down — yours.", "Guardian's bulwark, your downfall."],
  lukas: ["Newcomer energy. Veteran casualties.", "Flashy entrance. Your exit."],
  lunox: ["Light and dark agree on one thing: you lose.", "Cosmic balance. Your imbalance."],
  lylia: ["Bombs away, brains away — yours.", "Little feet, big explosions."],
  marcel: ["Mystery guest. Your funeral plus-one.", "New face. Old ending for you."],
  martis: ["Ashura's fury, your eulogy.", "Decimate the HP. Decimate the hope."],
  masha: ["Three bars. Zero patience.", "Bear down. You fall down."],
  minsitthar: ["Spear of order. Disorder for you.", "No blinking allowed. Especially you."],
  minotaur: ["Rage bar full. Brain bar empty — yours.", "Minoan fury, minor results — yours."],
  miya: ["Moonlight sonata in a minor key.", "Invisible sometimes. Irrelevant never — wait, reverse that."],
  moskov: ["Spears pierce. So do regrets.", "Abyss walker, grave maker."],
  natan: ["Time traveler with your expiration date.", "Entropy always wins. Today it's personal."],
  nolan: ["Cosmic rider, your undertaker.", "Rift runner. You can't outrun this."],
  novaria: ["Astral vision. Your obituary in HD.", "Star reader. Grave writer."],
  obsidia: ["Bone to pick. It's yours.", "Fracture critical. You critical."],
  odette: ["Swan song. Your swan dive.", "Enchanted serenade, cursed audience — you."],
  phoveus: ["Demonic arrival. Your departure.", "Terror incarnate. You're the terrified."],
  rafaela: ["Holy healing. Unholy ending — yours.", "Blessed wings. Cursed aim — yours."],
  roger: ["Full moon, full send.", "Man by day. Your nightmare by night."],
  ruby: ["Hook, line, and sinker — you're the sinker.", "Offended? You should be. It's over."],
  saber: ["Triple sweep. No survivors, no witnesses.", "Orbiting blades. Your orbit ends here."],
  selena: ["Abyssal arrow, abyssal outcome.", "Stun first. Sympathy never."],
  silvanna: ["Spiral strangling, hope mangling.", "Imperial justice. Your injustice."],
  sora: ["New star. Same black hole — you.", "Debutante of doom."],
  sun: ["Triple trouble, triple funeral.", "Which one's real? Doesn't matter. You're done."],
  suyou: ["Ink blade, your blood type.", "Brush strokes. Death notes."],
  thamuz: ["Lord of lava. King of your crater.", "Burning passion. You're the fuel."],
  tigreal: ["Sacred hammer. Profane results — for you.", "Implosion nation. Population: you."],
  uranus: ["Radiant damage. Your radiant defeat.", "Consecration? More like your cremation."],
  vale: ["Windblown. Mind blown — yours.", "Gale force. Fail force — yours."],
  valir: ["Fire mage. Fire sale on your HP.", "Burst fire. Burst laughter — mine."],
  vexana: ["Death knell. Your funeral bell.", "The knight rises. You fall."],
  wanwan: ["Weaknesses exposed. Yours, mostly.", "Tiger pace. Your last race."],
  "x-borg": ["Armor on. Mercy off.", "Firaga heat. Your defeat."],
  "yi-sun-shin": ["Fleet commander. Your ship has sailed — sunk.", "Turtle ship. Your turtle speed."],
  yin: ["My world, my rules. Your funeral.", "Evil within. Your end without."],
  zetian: ["Celestial edict. Your eviction notice.", "Elysian light. Your darkest hour."],
  zhask: ["Nightmare spawn. Daymare for you.", "Beetles bite. You perish."],
  zhuxin: ["Lantern lit. Verdict delivered — yours.", "Beacon tossed. Hope lost — yours."],
  zilong: ["Sprint now, think never.", "Spear first. Apology in the next life."],
};
