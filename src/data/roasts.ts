// Local roast engine — no AI API needed.
// Templates are keyed by hero, role, and roast level. Engine randomizes
// and avoids immediate repeats.

export type RoastLevel = "friendly" | "spicy" | "disrespectful";
export type RoleKey = "Jungle" | "Mid Lane" | "Gold Lane" | "EXP Lane" | "Roam";

export const ROAST_LEVELS: { id: RoastLevel; label: string; blurb: string }[] = [
  { id: "friendly", label: "FRIENDLY", blurb: "Light teasing" },
  { id: "spicy", label: "SPICY", blurb: "Tournament trash-talk" },
  { id: "disrespectful", label: "ABSOLUTELY DISRESPECTFUL", blurb: "Sign the waiver" },
];

const HERO_ROASTS: Record<string, Record<RoastLevel, string[]>> = {
  fanny: {
    friendly: [
      "{name}, you play Fanny like the cables have a data cap — three swings and you're filing for bankruptcy.",
      "Your Fanny has great frequent-flyer miles: straight from base to gray screen.",
    ],
    spicy: [
      "You play Fanny like the cables are controlled by Wi-Fi. Even the Lord dodges your ropes.",
      "{name}, your cables have more missed connections than a budget airline.",
    ],
    disrespectful: [
      "{name}, your Fanny gameplay should be studied as a tutorial on how to donate energy to the enemy buff.",
      "I've seen Laylas with better cable management — and Layla doesn't even HAVE cables.",
    ],
  },
  estes: {
    friendly: ["You're basically Estes without the healing — great vibes, zero sustain."],
    spicy: ["You're basically Estes without the healing. Your teammates have more chance surviving Lord than surviving your rotations."],
    disrespectful: ["{name}, you picked Estes and STILL nobody wants you around. That's not a support problem, that's a you problem."],
  },
  franco: {
    friendly: ["Your Franco hooks the way I text my ex — desperate and always at the wrong target."],
    spicy: ["You have Franco's hook accuracy but somehow you're hooking the wrong team, {name}."],
    disrespectful: ["{name}, your hooks miss so often the enemy Roam filed a restraining order out of pity."],
  },
  layla: {
    friendly: ["Your positioning is so adventurous even the observer cam needs a map."],
    spicy: ["Your positioning is so bad even Layla would uninstall, {name}."],
    disrespectful: ["{name}, you stand in teamfights like you're waiting for a bus — and the bus is the enemy Hayabusa."],
  },
  johnson: {
    friendly: ["You drive like Johnson on the first day of driving school."],
    spicy: ["You drive like Johnson but somehow still miss every rotation, {name}."],
    disrespectful: ["{name}, your Johnson ult has GPS — it just navigates exclusively into walls and regret."],
  },
  chou: {
    friendly: ["Your Chou kick has two settings: whiff and 'wrong guy'."],
    spicy: ["You've been practicing Chou for three years and still haven't found the kick button, {name}."],
    disrespectful: ["{name}, your Way of the Dragon is just Uber Eats — delivering YOURSELF to the enemy backline."],
  },
  nana: {
    friendly: ["Even Molina second-guesses your calls."],
    spicy: ["Even Molina has better decision-making than your last Lord call, {name}."],
    disrespectful: ["{name}, you get outplayed by a passive. A PASSIVE. Molina is doing the thinking for both of you."],
  },
  ling: {
    friendly: ["Your Ling spends more time on walls than a cat poster."],
    spicy: ["{name}, your Ling ult dodges damage but can't dodge a 2–8 KDA."],
    disrespectful: ["Your blue buff has seen more of you than your family, and you STILL drop the Retri."],
  },
  default: {
    friendly: ["{name}, your {hero} is proof that confidence and competence are different stats."],
    spicy: ["{name}, your {hero} rotations have the map awareness of a ward placed in base."],
    disrespectful: ["{name}, the Turtle has better macro than you, and it literally walks in a circle waiting to die."],
  },
};

const ROLE_ROASTS: Record<RoleKey, Record<RoastLevel, string[]>> = {
  Jungle: {
    friendly: ["Jungle diff? More like jungle nap — wake up, the Turtle left without you."],
    spicy: ["You farm like the buffs pay rent and gank like the lanes owe YOU money. Backwards, {name}."],
    disrespectful: ["{name}, your Retribution timing is so bad the Lord filed for custody of the pit."],
  },
  "Mid Lane": {
    friendly: ["You rotate slower than patch notes download."],
    spicy: ["{name}, mid priority means YOU rotate first — not after both sidelanes are gray."],
    disrespectful: ["Your lane opponent roams, ganks, recalls, orders food — and still out-farms you, {name}."],
  },
  "Gold Lane": {
    friendly: ["You scale like a savings account with a 0.1% interest rate."],
    spicy: ["{name}, you're 0–3 in lane and still typing 'trust me I scale'. Nobody trusts you."],
    disrespectful: ["The enemy Gold laner took your tower, your farm, and your dignity — and left you the minion."],
  },
  "EXP Lane": {
    friendly: ["You lose the turtle fight and blame the weather in the Land of Dawn."],
    spicy: ["{name}, EXP stands for experience — so how are you the least experienced player in the lobby?"],
    disrespectful: ["You got solo-killed by a support, {name}. A SUPPORT. Log off and touch the nexus."],
  },
  Roam: {
    friendly: ["Your wards expire from loneliness before anyone ganks."],
    spicy: ["{name}, roaming means helping LANES — not sightseeing the enemy jungle at 10% HP."],
    disrespectful: ["You set vision like a horror movie director, {name} — every bush is a jumpscare for YOUR OWN team."],
  },
};

function pick<T>(arr: T[], avoid?: T): T {
  if (arr.length === 1) return arr[0];
  let c = arr[Math.floor(Math.random() * arr.length)];
  let guard = 0;
  while (c === avoid && guard++ < 8) c = arr[Math.floor(Math.random() * arr.length)];
  return c;
}

let lastRoast = "";

export function generateRoast(opts: {
  name: string;
  role: RoleKey;
  hero: string;
  level: RoastLevel;
}): { roast: string; title: string } {
  const name = opts.name.trim() || "Rookie";
  const heroKey = opts.hero.toLowerCase().replace(/[^a-z]/g, "");
  const heroBank = HERO_ROASTS[heroKey] ?? HERO_ROASTS.default;
  const heroLine = pick(heroBank[opts.level], lastRoast);
  const roleLine = pick(ROLE_ROASTS[opts.role][opts.level]);
  const roast = `${heroLine.replaceAll("{name}", name).replaceAll("{hero}", opts.hero)}\n\n${roleLine.replaceAll("{name}", name)}`;
  lastRoast = heroLine;
  const titles =
    opts.level === "friendly"
      ? ["LIGHT TAP", "GENTLE TAP"]
      : opts.level === "spicy"
        ? ["CRITICAL DAMAGE", "TRUE DAMAGE"]
        : ["CRITICAL DAMAGE", "SAVAGE — ENEMY HAS BEEN SLAIN"];
  return { roast, title: pick(titles) };
}

// ── Find-your-hero quiz ──
export interface QuizResult {
  hero: string;
  lane: string;
  traits: string[];
  blurb: string;
}

export function quizHero(answers: { style: string; death: string; vibe: string }): QuizResult {
  const key = `${answers.style}-${answers.death}-${answers.vibe}`;
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) % 997;
  const pool: QuizResult[] = [
    { hero: "Fanny", lane: "JUNGLE", traits: ["AGGRESSIVE", "MECHANICAL"], blurb: "You don't walk around walls. You fly over consequences." },
    { hero: "Franco", lane: "ROAM", traits: ["CHAOTIC", "PLAYMAKER"], blurb: "Your hooks are 10% skill, 90% audacity. It works out. Mostly." },
    { hero: "Valentina", lane: "MID", traits: ["TACTICAL", "ADAPTIVE"], blurb: "Why learn one ult when you can steal everyone's?" },
    { hero: "Beatrix", lane: "GOLD", traits: ["DISCIPLINED", "SHARPSHOOTER"], blurb: "Four guns. Zero patience. Infinite damage." },
    { hero: "Chou", lane: "ROAM", traits: ["PLAYMAKER", "FEARLESS"], blurb: "You kick problems. Sometimes the right problems." },
    { hero: "Ling", lane: "JUNGLE", traits: ["MECHANICAL", "STYLISH"], blurb: "Walls are suggestions. Gravity is optional." },
    { hero: "Estes", lane: "ROAM", traits: ["SUPPORTIVE", "CLUTCH"], blurb: "The team lives because you say so. Never let them forget it." },
    { hero: "Yu Zhong", lane: "EXP", traits: ["RELENTLESS", "BULLY"], blurb: "You don't win lane. You collect rent from it." },
  ];
  return pool[h % pool.length];
}

// ── Rate-my-main fake analyst stats ──
export function rateMain(hero: string): { stats: { label: string; value: number }[]; verdict: string } {
  let h = 0;
  for (const c of hero) h = (h * 33 + c.charCodeAt(0)) % 101;
  const rnd = (seed: number, min: number, max: number) => min + ((h * (seed + 7)) % (max - min + 1));
  const stats = [
    { label: "MECHANICS", value: rnd(1, 4, 10) },
    { label: "MAP AWARENESS", value: rnd(2, 2, 9) },
    { label: "POSITIONING", value: rnd(3, 1, 9) },
    { label: "MENTAL", value: rnd(4, 1, 8) },
    { label: "TEAMFIGHT IQ", value: rnd(5, 2, 10) },
  ];
  const avg = stats.reduce((a, s) => a + s.value, 0) / stats.length;
  const verdict =
    avg >= 8
      ? `The hero is elite. Whether YOU are is still under review.`
      : avg >= 6
        ? `The hero is carrying harder than you are. Show some gratitude.`
        : avg >= 4
          ? `Somewhere, a coach just felt a disturbance and doesn't know why.`
          : `Ban ${hero}. Not because it's weak — because we all need to heal.`;
  return { stats, verdict };
}

// ── Most-likely questions ──
export const MOST_LIKELY_QUESTIONS = [
  "Who's most likely to steal Lord?",
  "Who's most likely to rage quit a scrim?",
  "Who's most likely to miss Retribution?",
  "Who's most likely to say “lag” after losing?",
  "Who's most likely to get MVP?",
  "Who's most likely to recall in front of the enemy?",
];
