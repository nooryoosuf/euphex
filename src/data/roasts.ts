// Local roast engine — no AI API needed.
//
// Pick a ROLE → the engine associates a HERO with you and builds a roast
// from: hero opener + MLBB punchline + role closer. Combinations make
// immediate repeats effectively impossible (recent-output history).

export type RoastLevel = "friendly" | "spicy" | "disrespectful";
export type RoleKey = "Jungle" | "Mid Lane" | "Gold Lane" | "EXP Lane" | "Roam";

export const ROAST_LEVELS: { id: RoastLevel; label: string; blurb: string }[] = [
  { id: "friendly", label: "FRIENDLY", blurb: "Light teasing" },
  { id: "spicy", label: "SPICY", blurb: "Tournament trash-talk" },
  { id: "disrespectful", label: "ABSOLUTELY DISRESPECTFUL", blurb: "Sign the waiver" },
];

interface HeroRoast {
  display: string;
  roles: RoleKey[];
  lines: Record<RoastLevel, string[]>;
}

// ── HERO DATABASE (mechanic-accurate openers, {name} = roasted player) ──
const HEROES: Record<string, HeroRoast> = {
  // ——— JUNGLE ———
  fanny: {
    display: "Fanny",
    roles: ["Jungle"],
    lines: {
      friendly: [
        "{name}, you fly Fanny like sightseeing counts as ganking.",
        "Your cables connect about as often as hotel Wi-Fi, {name}.",
      ],
      spicy: [
        "You play Fanny like the cables are controlled by Wi-Fi.",
        "{name}, your energy bar is just a countdown to your execution.",
      ],
      disrespectful: [
        "{name}, your Fanny should be permabanned — by your own teammates, for their safety.",
        "Creeps have better cable placement than you, {name}. And they don't even have hands.",
      ],
    },
  },
  ling: {
    display: "Ling",
    roles: ["Jungle"],
    lines: {
      friendly: [
        "{name}, your Ling lives on walls because the ground is lava.",
        "You press the ult to dodge damage, {name} — shame it can't dodge a 2–8 KDA.",
      ],
      spicy: [
        "{name}, your Ling ult dodges everything except responsibility.",
        "Four swords, zero map awareness. The math isn't mathing, {name}.",
      ],
      disrespectful: [
        "Your blue buff has seen more of you than your family, and you STILL drop the Retri, {name}.",
        "{name}, you wall-hop like you're escaping your own team — honestly, valid.",
      ],
    },
  },
  hayabusa: {
    display: "Hayabusa",
    roles: ["Jungle"],
    lines: {
      friendly: [
        "{name}, your shadows do more work than you do.",
        "You ult the tank every time, {name}. The backline sends its regards.",
      ],
      spicy: [
        "{name}, your Hayabusa has four shadows and still can't cover your mistakes.",
        "You dive the backline and instantly regret all four of your life choices, {name}.",
      ],
      disrespectful: [
        "{name}, your Ougi hits like a strongly worded letter.",
        "Even your shadows left, {name}. They transferred to the enemy jungler.",
      ],
    },
  },
  joy: {
    display: "Joy",
    roles: ["Jungle"],
    lines: {
      friendly: [
        "{name}, your rhythm game ends the moment an enemy breathes on you.",
        "You miss one beat and the whole combo files for divorce, {name}.",
      ],
      spicy: [
        "{name}, your Joy ult gets interrupted more than a bad Zoom call.",
        "All that rhythm, {name}, and you still can't keep up with the Turtle timer.",
      ],
      disrespectful: [
        "{name}, the only thing electrifying about your Joy is how fast your HP disappears.",
        "Your beats per minute? Zero. Your deaths per minute? Asking for a friend, {name}.",
      ],
    },
  },
  lancelot: {
    display: "Lancelot",
    roles: ["Jungle"],
    lines: {
      friendly: [
        "{name}, your dashes are beautiful. Your damage is decorative.",
        "You poke like a gentleman and finish like a coward, {name}.",
      ],
      spicy: [
        "{name}, your Lancelot is all choreography, no homicide.",
        "You dash in, dash out, and somehow dash straight into the loss screen, {name}.",
      ],
      disrespectful: [
        "{name}, your Thorned Rose couldn't pop a balloon.",
        "Lancelot is a burst assassin, {name}. You are a burst of disappointment.",
      ],
    },
  },
  aamon: {
    display: "Aamon",
    roles: ["Jungle"],
    lines: {
      friendly: [
        "{name}, your camouflage fools everyone except the scoreboard.",
        "You appear, deal damage, and vanish — mostly from the teamfight, {name}.",
      ],
      spicy: [
        "{name}, your Aamon spends more time invisible than your jungler's ganks — oh wait.",
        "Invisible blades, visible 3–9 scoreline, {name}.",
      ],
      disrespectful: [
        "{name}, you're not camouflaged, you're just irrelevant to the fight.",
        "The enemy bought anti-invis, {name}. Your entire game plan is in shambles.",
      ],
    },
  },
  // ——— MID ———
  gusion: {
    display: "Gusion",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your daggers return faster than your common sense.",
        "One combo, one kill, one immediate death. The Gusion special, {name}.",
      ],
      spicy: [
        "{name}, your Gusion one-shots everything except the enemy's will to live.",
        "Ten daggers thrown, {name}, and somehow the minion tanked all of them.",
      ],
      disrespectful: [
        "{name}, your combo is: dash in, miss everything, recall in shame.",
        "Gusion rewards precision, {name}. You bring vibes and a death timer.",
      ],
    },
  },
  valentina: {
    display: "Valentina",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, you steal ults like samples at a food court.",
        "Why learn one ult when you can borrow everyone's badly, {name}?",
      ],
      spicy: [
        "{name}, your Valentina copies homework and still fails the test.",
        "You stole their ult AND their dignity — then lost the fight anyway, {name}.",
      ],
      disrespectful: [
        "{name}, you have access to every ult in the game and chose to be useless with all of them.",
        "Valentina adapts, {name}. You just mald in three different ability kits.",
      ],
    },
  },
  pharsa: {
    display: "Pharsa",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your bird form is just a faster way to arrive late.",
        "You ult from downtown and hit everything except the point, {name}.",
      ],
      spicy: [
        "{name}, your Pharsa bombs the teamfight like it's a weather event — random and harmless.",
        "Verri does the flying, {name}. You do the missing.",
      ],
      disrespectful: [
        "{name}, your wings are for escaping accountability, not ganking.",
        "The enemy walks out of your ult like it's a light drizzle, {name}.",
      ],
    },
  },
  yve: {
    display: "Yve",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your star map covers the lane and precisely nothing else.",
        "You slow everyone and kill no one — crowd control enthusiast, {name}.",
      ],
      spicy: [
        "{name}, your Yve zones the enemy the way a puddle zones traffic.",
        "Real World Manipulation, {name}, manipulated zero outcomes.",
      ],
      disrespectful: [
        "{name}, your ult is a screensaver. Pretty. Ignored. Useless.",
        "The galaxy is vast, {name}, and you missed all of it.",
      ],
    },
  },
  cecilion: {
    display: "Cecilion",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, you stack late-game damage for a late game you never reach.",
        "Thirty minutes of farming for a surrender at minute twelve, {name}.",
      ],
      spicy: [
        "{name}, your Cecilion scales infinitely and contributes finitely.",
        "Bats, bats everywhere — and not a single kill, {name}.",
      ],
      disrespectful: [
        "{name}, your stacks are just a high score in a game you're losing.",
        "Cecilion is a ticking time bomb, {name}. You're just ticking.",
      ],
    },
  },
  luoyi: {
    display: "Luo Yi",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your teleport delivers the team to the wrong fight, faster.",
        "Yin, yang, and your entire team in the enemy fountain, {name}.",
      ],
      spicy: [
        "{name}, your Diversion is just group travel to the death screen.",
        "You rotate the team like a tour guide with no map, {name}.",
      ],
      disrespectful: [
        "{name}, your portals should come with a refund policy.",
        "Luo Yi controls duality, {name}. You control neither lane nor dignity.",
      ],
    },
  },
  aurora: {
    display: "Aurora",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your freeze is the only chill thing about your gameplay.",
        "You charge the frost bar for a combo the enemy sidesteps, {name}.",
      ],
      spicy: [
        "{name}, your Aurora brings the ice age and leaves with the stone age KDA.",
        "Frozen enemies, frozen farm, frozen rank — everything's frozen except your deaths, {name}.",
      ],
      disrespectful: [
        "{name}, your ult is a snow globe: shaken, decorative, forgotten.",
        "The Maiden of Ice, {name}, played like a puddle in July.",
      ],
    },
  },
  kagura: {
    display: "Kagura",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your umbrella returns to you. Your teammates won't.",
        "You juggle the umbrella beautifully while the lane burns, {name}.",
      ],
      spicy: [
        "{name}, your Kagura has seventeen combos and uses none of them correctly.",
        "Seimei umbrella open, {name}, brain closed.",
      ],
      disrespectful: [
        "{name}, you throw the umbrella away like your team's win condition.",
        "Kagura rewards hands, {name}. Yours are on vacation.",
      ],
    },
  },
  nana: {
    display: "Nana",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "Even Molina second-guesses your calls, {name}.",
        "{name}, your Molina form has better positioning than you do.",
      ],
      spicy: [
        "Even Molina has better decision-making than your last Lord call, {name}.",
        "{name}, you get out-rotated by a passive. A PASSIVE.",
      ],
      disrespectful: [
        "{name}, you get outplayed by a passive. A PASSIVE. Molina is doing the thinking for both of you.",
        "Nana has two lives, {name}, and you've thrown both before minute five.",
      ],
    },
  },
  xavier: {
    display: "Xavier",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your light beams snipe everything except what matters.",
        "You hold the line from three screens away, {name}. Cowardice with range.",
      ],
      spicy: [
        "{name}, your Xavier ult crosses the map to miss with style.",
        "Infinite Extinction, {name} — infinite being the operative word for your whiffs.",
      ],
      disrespectful: [
        "{name}, your mystic field traps exactly one person: you, in Gold rank.",
        "The light reveals all, {name}. Mostly that you can't aim.",
      ],
    },
  },
  hirara: {
    display: "Hirara",
    roles: ["Mid Lane"],
    lines: {
      friendly: [
        "{name}, your embers look expensive and do economy damage.",
        "Gilded everything, golden nothing, {name}.",
      ],
      spicy: [
        "{name}, your Hirara shines bright and fades faster than your lead.",
        "All that gold, {name}, and you still can't buy a win.",
      ],
      disrespectful: [
        "{name}, your gilded embers couldn't melt an ice cube.",
        "Hirara is brand new, {name}, and already disappointed in you.",
      ],
    },
  },
  // ——— GOLD ———
  beatrix: {
    display: "Beatrix",
    roles: ["Gold Lane"],
    lines: {
      friendly: [
        "{name}, four guns and you still can't shoot down your own ego.",
        "You swap weapons mid-fight like outfit changes, {name}. None of them fit.",
      ],
      spicy: [
        "{name}, your Beatrix has an answer for everything except the enemy jungler.",
        "Nibiru, Renner, Wesker — and your KDA is still in witness protection, {name}.",
      ],
      disrespectful: [
        "{name}, your Renner shot could miss a stationary Lord. It has. Twice.",
        "Beatrix is a walking arsenal, {name}. You're a walking liability with extra steps.",
      ],
    },
  },
  claude: {
    display: "Claude",
    roles: ["Gold Lane"],
    lines: {
      friendly: [
        "{name}, your Dexter does the farming. You do the feeding.",
        "You ult in, spin around, and accomplish cardio, {name}.",
      ],
      spicy: [
        "{name}, your Claude dives the backline and donates a shutdown.",
        "Blazing Duet, {name} — blazingly fast way to die.",
      ],
      disrespectful: [
        "{name}, your monkey has a better KDA than you. Let that sink in.",
        "Claude steals attack speed, {name}. You steal your team's patience.",
      ],
    },
  },
  brody: {
    display: "Brody",
    roles: ["Gold Lane"],
    lines: {
      friendly: [
        "{name}, your stacks expire faster than your relevance.",
        "You charge the shot, aim carefully, and hit the tank, {name}. Classic.",
      ],
      spicy: [
        "{name}, your Brody needs four stacks and still can't finish the job.",
        "Abyss marks for everyone — damage for no one, {name}.",
      ],
      disrespectful: [
        "{name}, your ult does less damage than your excuses.",
        "Brody punishes mistakes, {name}. Yours go entirely unpunished — by you.",
      ],
    },
  },
  melissa: {
    display: "Melissa",
    roles: ["Gold Lane"],
    lines: {
      friendly: [
        "{name}, your doll watches you lose from the best seat in the house.",
        "You go untargetable and still find a way to die, {name}. Talent.",
      ],
      spicy: [
        "{name}, your Melissa threads needles and still sews a loss.",
        "Muddles everywhere, {name}, muddled nowhere that matters.",
      ],
      disrespectful: [
        "{name}, your doll has seen things. Mostly you inting.",
        "Melissa can't be targeted, {name}. Your rank can — it's dropping.",
      ],
    },
  },
  layla: {
    display: "Layla",
    roles: ["Gold Lane"],
    lines: {
      friendly: [
        "{name}, your range increases with every death. Evolution!",
        "You outrange everyone and outlive no one, {name}.",
      ],
      spicy: [
        "Your positioning is so bad even Layla would uninstall, {name}.",
        "{name}, your Malefic Gun charges up just in time to watch the nexus fall.",
      ],
      disrespectful: [
        "{name}, you stand in teamfights like you're waiting for a bus — and the bus is the enemy Hayabusa.",
        "Layla is the tutorial hero, {name}. You're still stuck on the tutorial.",
      ],
    },
  },
  lesley: {
    display: "Lesley",
    roles: ["Gold Lane"],
    lines: {
      friendly: [
        "{name}, your camouflage hides you from the fight, not the blame.",
        "One shot, one kill, seven minutes of farming, {name}.",
      ],
      spicy: [
        "{name}, your Lesley snipes the support and calls it carrying.",
        "Lethal Sniper, {name} — lethally allergic to objectives.",
      ],
      disrespectful: [
        "{name}, your ult executes low-HP enemies and high-HP friendships.",
        "Lesley rewards patience, {name}. Your team ran out two seasons ago.",
      ],
    },
  },
  // ——— EXP ———
  yuzhong: {
    display: "Yu Zhong",
    roles: ["EXP Lane"],
    lines: {
      friendly: [
        "{name}, your dragon form arrives after the fight ends. Fashionably late.",
        "You petrify the air and miss the human, {name}.",
      ],
      spicy: [
        "{name}, your Yu Zhong dives five people and blames the follow-up.",
        "Black Dragon, {name}, zero-dragon damage output.",
      ],
      disrespectful: [
        "{name}, your dragon form is just a bigger target.",
        "Yu Zhong sustains through everything, {name} — except your decision-making.",
      ],
    },
  },
  terizla: {
    display: "Terizla",
    roles: ["EXP Lane"],
    lines: {
      friendly: [
        "{name}, your hammer falls slower than your rank.",
        "You ult the wave and call it zone control, {name}.",
      ],
      spicy: [
        "{name}, your Terizla has three hammers and zero follow-through.",
        "Penalty Zone, {name} — penalizing only your own team.",
      ],
      disrespectful: [
        "{name}, your ult telegraphs like a handwritten letter.",
        "Terizla punishes positioning, {name}. Yours punishes spectators.",
      ],
    },
  },
  paquito: {
    display: "Paquito",
    roles: ["EXP Lane"],
    lines: {
      friendly: [
        "{name}, your combos look great in the practice tool.",
        "Jab, jab, uppercut — straight into the enemy tower, {name}.",
      ],
      spicy: [
        "{name}, your Paquito boxes shadows and loses on points.",
        "Champ stance, {name}, chump results.",
      ],
      disrespectful: [
        "{name}, your knockout punch knocks out your own win streak.",
        "Paquito needs rhythm, {name}. You have arrhythmia.",
      ],
    },
  },
  lapulapu: {
    display: "LapuLapu",
    roles: ["EXP Lane"],
    lines: {
      friendly: [
        "{name}, your heavy sword swings at ghosts and regrets.",
        "You switch stances mid-fight like it changes the outcome, {name}.",
      ],
      spicy: [
        "{name}, your LapuLapu ults the frontline and tickles the backline's memory.",
        "Brave stance, {name}, fragile game sense.",
      ],
      disrespectful: [
        "{name}, your blades spin for style points in a losing game.",
        "LapuLapu dives with honor, {name}. You dive alone.",
      ],
    },
  },
  badang: {
    display: "Badang",
    roles: ["EXP Lane"],
    lines: {
      friendly: [
        "{name}, your wall punch builds great walls. Shame about the punching.",
        "You fist-fight the Lord and the Lord wins, {name}.",
      ],
      spicy: [
        "{name}, your Badang traps enemies and frees them with kindness.",
        "Fist Break, fist miss, fist yourself, {name}.",
      ],
      disrespectful: [
        "{name}, your fists of zen achieve enlightenment: you are the problem.",
        "Badang locks down lanes, {name}. You lock down losses.",
      ],
    },
  },
  belerick: {
    display: "Belerick",
    roles: ["EXP Lane"],
    lines: {
      friendly: [
        "{name}, your passive reflects damage and attracts blame.",
        "Ancient seed, modern problems, {name}.",
      ],
      spicy: [
        "{name}, your Belerick soaks damage and produces nothing but ult charge for them.",
        "You root the team and the team roots against you, {name}.",
      ],
      disrespectful: [
        "{name}, you're a tree with a death wish and a 1–7–4 lifeline.",
        "Belerick is unkillable, {name}. Somehow you're the exception.",
      ],
    },
  },
  benedetta: {
    display: "Benedetta",
    roles: ["EXP Lane"],
    lines: {
      friendly: [
        "{name}, your dashes rewrite physics and your results rewrite history.",
        "Eye for an eye, {name}, blind to the minimap.",
      ],
      spicy: [
        "{name}, your Benedetta immune-frames everything except criticism.",
        "All those dashes, {name}, and you still arrive at defeat on time.",
      ],
      disrespectful: [
        "{name}, your swordplay is performance art with a body count — yours.",
        "Benedetta is untouchable, {name}. Your nexus isn't.",
      ],
    },
  },
  // ——— ROAM ———
  estes: {
    display: "Estes",
    roles: ["Roam"],
    lines: {
      friendly: [
        "You're basically Estes without the healing — great vibes, zero sustain, {name}.",
        "{name}, your heals arrive like apologies: late and insufficient.",
      ],
      spicy: [
        "You're basically Estes without the healing. Your teammates have more chance surviving Lord than surviving your rotations, {name}.",
        "{name}, your moonlight stacks beautifully while your ADC decomposes.",
      ],
      disrespectful: [
        "{name}, you picked Estes and STILL nobody wants you around. That's not a support problem, that's a you problem.",
        "Estes keeps the team alive, {name}. You keep the respawn timer busy.",
      ],
    },
  },
  franco: {
    display: "Franco",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, your hooks have main-character energy and extra-cast accuracy.",
        "You hook the buff, the minion, the air — the enemy sends thanks, {name}.",
      ],
      spicy: [
        "You have Franco's hook accuracy but somehow you're hooking the wrong team, {name}.",
        "{name}, your Iron Hook files more missed reports than the weather service.",
      ],
      disrespectful: [
        "{name}, your hooks miss so often the enemy roamer filed a restraining order out of pity.",
        "Franco suppresses targets, {name}. You suppress your team's will to queue.",
      ],
    },
  },
  chou: {
    display: "Chou",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, your kick has two settings: whiff and wrong guy.",
        "You immune the crowd control and eat the damage anyway, {name}.",
      ],
      spicy: [
        "You've been practicing Chou for three years and still haven't found the kick button, {name}.",
        "{name}, your Way of the Dragon delivers the enemy carry — to safety.",
      ],
      disrespectful: [
        "{name}, your Way of the Dragon is just Uber Eats — delivering YOURSELF to the enemy backline.",
        "Chou frees himself from CC, {name}. Nothing frees your team from you.",
      ],
    },
  },
  khufra: {
    display: "Khufra",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, your bouncing ball bounces past every important fight.",
        "You ball-form into the team and out of the win column, {name}.",
      ],
      spicy: [
        "{name}, your Khufra counters dashes by dashing away from responsibility.",
        "Tyrant's Revenge, {name} — revenge against your own rank.",
      ],
      disrespectful: [
        "{name}, your bouncing ball is just a pinball of poor decisions.",
        "Khufra stops mobility, {name}. You stop momentum.",
      ],
    },
  },
  mathilda: {
    display: "Mathilda",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, your wisps guide the team straight into danger, faster.",
        "You offer a ride and everyone declines, {name}. Even the souls.",
      ],
      spicy: [
        "{name}, your Mathilda ult grabs the air and drops the team.",
        "Guiding Wind, {name} — guiding everyone to the defeat screen.",
      ],
      disrespectful: [
        "{name}, your wisps abandoned you mid-ult. Smart souls.",
        "Mathilda flies the team to plays, {name}. You fly solo to reports.",
      ],
    },
  },
  atlas: {
    display: "Atlas",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, your Fatal Links catch three enemies and zero follow-up.",
        "You eject, engage, and exit the game early, {name}.",
      ],
      spicy: [
        "{name}, your Atlas chains the team together — in shared disappointment.",
        "Perfect engine, {name}, perfect setup, perfectly ignored by your damage dealers.",
      ],
      disrespectful: [
        "{name}, your Fatal Links should link you to a tutorial.",
        "Atlas drags enemies to doom, {name}. You drag teammates to queue-dodge.",
      ],
    },
  },
  angela: {
    display: "Angela",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, you attach to the carry and detach from reality.",
        "Your shield arrives posthumously, {name}. Thoughts and prayers.",
      ],
      spicy: [
        "{name}, your Angela ults the 0–6 fighter out of pure loyalty. Misplaced.",
        "You heart-guard the wrong person every single fight, {name}.",
      ],
      disrespectful: [
        "{name}, your doll strings control a puppet with no audience.",
        "Angela saves lives, {name}. You save your KDA by shielding and hiding.",
      ],
    },
  },
  johnson: {
    display: "Johnson",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, your drives end in walls, laughs, and surrender votes.",
        "You pick up passengers and drop them at the scene of the crime, {name}.",
      ],
      spicy: [
        "You drive like Johnson but somehow still miss every rotation, {name}.",
        "{name}, your Rapid Touchdown touches down in the wrong postcode.",
      ],
      disrespectful: [
        "{name}, your Johnson ult has GPS — it navigates exclusively into walls and regret.",
        "Johnson crashes into enemies, {name}. You crash into your team's patience.",
      ],
    },
  },
  natalia: {
    display: "Natalia",
    roles: ["Roam", "Jungle"],    lines: {
      friendly: [
        "{name}, your stealth fools the minimap and nobody else.",
        "You lurk in the bush so long the bush pays rent, {name}.",
      ],
      spicy: [
        "{name}, your Natalia appears exactly when the fight is over.",
        "Silence, ambush, execute — the theory. In practice: spotted, panicked, deleted, {name}.",
      ],
      disrespectful: [
        "{name}, your stealth has a tell: the defeat screen loading.",
        "Natalia hunts in silence, {name}. Your gameplay screams.",
      ],
    },
  },
  minotaur: {
    display: "Minotaur",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, your rage bar fills faster than your team's confidence drains.",
        "You ult when the rage is full and the team is gone, {name}. Tragic timing.",
      ],
      spicy: [
        "{name}, your Minoan Fury hits everything except the reason you're losing.",
        "Full rage, full engage, full team wipe — yours, {name}.",
      ],
      disrespectful: [
        "{name}, your rage mode is just anger management with a death timer.",
        "Minotaur protects the team, {name}. You need protection from yourself.",
      ],
    },
  },
  grock: {
    display: "Grock",
    roles: ["Roam"],
    lines: {
      friendly: [
        "{name}, you hug walls for power and hug defeat for comfort.",
        "No wall, no Grock, no wins, {name}. Geography diff.",
      ],
      spicy: [
        "{name}, your Grock leaves the wall and leaves the game.",
        "Guardian's Barrier, {name} — barricading your own escape route.",
      ],
      disrespectful: [
        "{name}, you're a fortress with the gates wide open.",
        "Grock is immovable, {name}. Your rank moves plenty — downward.",
      ],
    },
  },
  rafaela: {
    display: "Rafaela",
    roles: ["Roam"],    lines: {
      friendly: [
        "{name}, your heals tickle and your stun politely suggests stopping.",
        "You speed-boost the team straight into the wipe, {name}. Efficient.",
      ],
      spicy: [
        "{name}, your Rafaela is a hospital that only treats the enemy's boredom.",
        "Holy Baptism, {name} — baptizing your team into the loss column.",
      ],
      disrespectful: [
        "{name}, your healing couldn't save a practice bot.",
        "Rafaela sustains pushes, {name}. You sustain excuses.",
      ],
    },
  },
  clint: {
    display: "Clint",
    roles: ["Gold Lane"],
    lines: {
      friendly: ["{name}, your gun jams every time it matters. Impressive consistency.", "You blind the enemy and still get outplayed, {name}. They fight blind better."],
      spicy: ["{name}, your Clint ult fires blanks and your laning fires warnings.", "Howitzer, {name} — how about zero damage instead?"],
      disrespectful: ["{name}, your Blind Smoke couldn't hide your 2–7 scoreline.", "Clint is a sharpshooter, {name}. You're a share-your-loss streamer."],
    },
  },
  miya: {
    display: "Miya",
    roles: ["Gold Lane"],
    lines: {
      friendly: ["{name}, your Moonlight Shadow hides you from the fight, not the flame.", "You ult to escape and arrive at the same defeat, {name}."],
      spicy: ["{name}, your Miya goes invisible and the game improves for everyone else.", "Turbo Stealth, {name} — turbo inting, more like."],
      disrespectful: ["{name}, your arrows split and so does your team's patience.", "Miya is the beginner's bow, {name}. You're still drawing it wrong."],
    },
  },
  hanabi: {
    display: "Hanabi",
    roles: ["Gold Lane"],
    lines: {
      friendly: ["{name}, your petals bounce to everyone except your KDA.", "You immune with the shield and die with the team, {name}. Loyalty!"],
      spicy: ["{name}, your Hanabi spreads damage thinner than your excuses.", "Petal Barrage, {name} — bombarding the scoreboard with deaths."],
      disrespectful: ["{name}, your bounces hit five enemies and zero consequences.", "Hanabi blooms late, {name}. You never bloom at all."],
    },
  },
  obsidia: {
    display: "Obsidia",
    roles: ["Gold Lane"],
    lines: {
      friendly: ["{name}, your bone shards scatter like your game plan.", "You charge the burst and discharge a whimper, {name}."],
      spicy: ["{name}, your Obsidia spikes the ground and your team's hopes.", "All fracture, no function, {name}."],
      disrespectful: ["{name}, your shards couldn't cut queue time.", "Obsidia breaks armor, {name}. You break spirits — your own team's."],
    },
  },
  odette: {
    display: "Odette",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your Swan Song gets interrupted by a stiff breeze.", "You sing, they silence, you perish. The ballad of {name}."],
      spicy: ["{name}, your Odette ult is a concert nobody attends — they just CC the singer.", "Swan Song, {name} — more like swan dive onto the defeat screen."],
      disrespectful: ["{name}, your song needs a backup dancer: your respawn timer.", "Odette enchants crowds, {name}. You enchant the enemy kill feed."],
    },
  },
  vale: {
    display: "Vale",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your wind blows the enemy gently toward victory.", "You knock up the air and the air knocks you down, {name}."],
      spicy: ["{name}, your Vale upgrades everything except his pilot.", "Windstorm, {name} — storming straight past every target."],
      disrespectful: ["{name}, your tornado is a fan. Literally just a fan.", "Vale controls the skies, {name}. You control nothing, not even the wave."],
    },
  },
  zhuxin: {
    display: "Zhuxin",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your lantern lights the way to your own demise.", "You yoink one enemy and the other four yoink you, {name}."],
      spicy: ["{name}, your Zhuxin grabs the tank and calls it a pick.", "Beacon toss, {name} — tossing away another teamfight."],
      disrespectful: ["{name}, your lantern should come with a missing-person report.", "Zhuxin abducts victims, {name}. You're the victim. Every game."],
    },
  },
  vexana: {
    display: "Vexana",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your knight fights bravely while you hide bravely.", "You curse the enemy and bless them with survival, {name}."],
      spicy: ["{name}, your Vexana raises the dead and buries the living — your team.", "Eternal Guard, {name} — eternally guarding an empty lane."],
      disrespectful: ["{name}, your undead knight has a better record than you.", "Vexana commands death, {name}. Death commands you. Regularly."],
    },
  },
  gord: {
    display: "Gord",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your laser is a flashlight of false hope.", "You channel the beam and the enemy channels around it, {name}."],
      spicy: ["{name}, your Gord ult paints the ground and misses the canvas.", "Mystic Projectile, {name} — mystically avoiding all value."],
      disrespectful: ["{name}, your laser pointer couldn't bother a cat.", "Gord melts frontlines, {name}. You melt your team's morale."],
    },
  },
  lunox: {
    display: "Lunox",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your light and dark cancel out like your impact.", "Order, chaos, and a 4–6–3 statline, {name}. Balance!"],
      spicy: ["{name}, your Lunox juggles two powers and drops both.", "Brilliance and darkness, {name}, neither of them carrying."],
      disrespectful: ["{name}, your cosmic fission splits atoms and your team's composure.", "Lunox bends duality, {name}. You bend over for every gank."],
    },
  },
  zetian: {
    display: "Zetian",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your celestial edict decrees nothing, absolutely nothing.", "The empress commands and the enemy yawns, {name}."],
      spicy: ["{name}, your Zetian rules the sky and rents the dirt.", "Elysian light, {name}, illuminating only your mistakes."],
      disrespectful: ["{name}, your dynasty ends at minute eight, every game.", "Zetian ascends the throne, {name}. The throne is in Gold rank."],
    },
  },
  eudora: {
    display: "Eudora",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your combo deletes one person and your relevance.", "Forked lightning, forked results, {name}."],
      spicy: ["{name}, your Eudora one-shots the support and gets one-shot by everyone else.", "Thunder's Wrath, {name} — wrath aimed exclusively at squishies and your dignity."],
      disrespectful: ["{name}, your stun lasts two seconds. Your death lasts longer.", "Eudora is point-and-click, {name}. You still miss the point."],
    },
  },
  kadita: {
    display: "Kadita",
    roles: ["Mid Lane"],
    lines: {
      friendly: ["{name}, your waves wash over the enemy like spa water.", "You ride the wave in and wipe out on it, {name}. Surfer tragedy."],
      spicy: ["{name}, your Kadita surfaces, ults the air, and submerges in shame.", "Ocean's Ode, {name} — an ode to missing everything."],
      disrespectful: ["{name}, your tidal waves couldn't sink a paper boat.", "Kadita rules the seas, {name}. You rule the respawn queue."],
    },
  },
};

// ── MLBB PUNCHLINES (Retri / Lord / Turtle / bush / recall lore) ──
const PUNCHLINES: Record<RoastLevel, string[]> = {
  friendly: [
    "Your Retribution has a snooze button and you keep pressing it.",
    "You contest the Turtle like it's optional DLC.",
    "Your bush checks consist of face-checking with your face.",
    "You recall in front of the enemy like you're signing autographs.",
    "Your rotations arrive with a " + "“sorry I'm late” " + "attached.",
    "You farm your buff while the Lord takes your inhibitor.",
    "Your ping is fine. Your decisions are the lag, {name}.",
    "You save your flicker for the post-game lobby.",
    "Your KDA has more deaths than your kill participation has meaning.",
    "You push the lane nobody's in and miss the fight everybody's at.",
  ],
  spicy: [
    "Your Retribution timing is sponsored by missed alarms, {name}.",
    "The Lord has seen your smite attempts and feels safer than ever.",
    "You ward the bush you're standing in. Visionary, {name}.",
    "Your recall game is elite. Your return game doesn't exist.",
    "You rotate like a revolving door — lots of motion, nobody gets anywhere, {name}.",
    "The Turtle filed a noise complaint about your farming patterns.",
    "You blame lag with 20ms ping, {name}. Bold strategy.",
    "Your flicker is on cooldown from the last game. Still.",
    "Your KDA is a cry for help written in numbers, {name}.",
    "You split-push while your team gets wiped, then type “?” like a detective.",
  ],
  disrespectful: [
    "The Lord has specifically requested you keep contesting, {name}. Free kills.",
    "Your Retribution could miss a stationary creep. It has. The clip exists.",
    "You face-check bushes the way crash-test dummies face-check walls, {name}.",
    "Your recall key is worn out. Your win key was never installed.",
    "Your rotations need a GPS, a map, and a search party, {name}.",
    "The Turtle out-farmed you. The TURTLE. It walks in a circle.",
    "Lag doesn't explain it, {name}. We've seen the replay. Twice.",
    "Your flicker button is decorative at this point. Museum piece.",
    "Your KDA should be studied as a warning label, {name}.",
    "You push side lanes like you're avoiding your team — mutual feeling.",
  ],
};

// ── ROLE CLOSERS ──
const ROLE_CLOSERS: Record<RoleKey, Record<RoastLevel, string[]>> = {
  Jungle: {
    friendly: ["Jungle diff? More like jungle nap — the Turtle left without you.", "You farm like the buffs pay rent. They don't. Gank something."],
    spicy: ["You farm like the buffs pay rent and gank like the lanes owe YOU money. Backwards, {name}.", "Three lanes are losing and you're doing krugs. Priorities, {name}."],
    disrespectful: ["{name}, your Retribution timing is so bad the Lord filed for custody of the pit.", "The enemy jungler sends your laners postcards from their jungle, {name}. You're never home."],
  },
  "Mid Lane": {
    friendly: ["You rotate slower than patch notes download.", "Mid priority means YOU move first. The memo is three seasons old."],
    spicy: ["{name}, mid priority means YOU rotate first — not after both sidelanes are gray.", "Your roams arrive with flowers for the corpses, {name}."],
    disrespectful: ["Your lane opponent roams, ganks, recalls, orders food — and still out-farms you, {name}.", "Mid is the map's heart, {name}. You're cardiac arrest."],
  },
  "Gold Lane": {
    friendly: ["You scale like a savings account with 0.1% interest.", "Greed is good until minute two, {name}. Then it's just feeding."],
    spicy: ["{name}, you're 0–3 in lane and still typing “trust me I scale”. Nobody trusts you.", "Your tower fell so early it counts as a speedrun, {name}."],
    disrespectful: ["The enemy Gold laner took your tower, your farm, and your dignity — and left you the minion.", "You scale into irrelevance with remarkable consistency, {name}."],
  },
  "EXP Lane": {
    friendly: ["You lose the turtle fight and blame the weather in the Land of Dawn.", "Trade? You donate, {name}."],
    spicy: ["{name}, EXP stands for experience — so how are you the least experienced player in the lobby?", "You win lane and lose game. Somehow the worse combo, {name}."],
    disrespectful: ["You got solo-killed by a support, {name}. A SUPPORT. Log off and touch the nexus.", "Your lane is a charity and the enemy is the sole beneficiary, {name}."],
  },
  Roam: {
    friendly: ["Your wards expire from loneliness before anyone ganks.", "Roaming means helping lanes — the lanes, {name}. Not the scenery."],
    spicy: ["{name}, roaming means helping LANES — not sightseeing the enemy jungle at 10% HP.", "Your engages need a permission slip signed by all four teammates, {name}."],
    disrespectful: ["You set vision like a horror director, {name} — every bush is a jumpscare for YOUR OWN team.", "Your roams are just scenic tours ending in team wipes, {name}."],
  },
};

export interface RoastResult {
  roast: string;
  title: string;
  hero: string;
  level: RoastLevel;
}

const TITLES: Record<RoastLevel, string[]> = {
  friendly: ["LIGHT TAP", "GENTLE TAP"],
  spicy: ["CRITICAL DAMAGE", "TRUE DAMAGE"],
  disrespectful: ["CRITICAL DAMAGE", "SAVAGE — ENEMY HAS BEEN SLAIN"],
};

// recent-output memory — avoids repeats across the session
const recentHeroes: string[] = [];
const recentLines: string[] = [];

function pick<T>(arr: T[], avoid: T[] = []): T {
  const fresh = arr.filter((x) => !avoid.includes(x));
  const pool = fresh.length ? fresh : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

function fill(template: string, name: string): string {
  return template.replaceAll("{name}", name);
}

export function roleHeroes(role: RoleKey): { slug: string; display: string }[] {
  return Object.entries(HEROES)
    .filter(([, h]) => h.roles.includes(role))
    .map(([slug, h]) => ({ slug, display: h.display }));
}

export function generateRoast(opts: { name: string; role: RoleKey; level: RoastLevel }): RoastResult {
  const name = opts.name.trim() || "Rookie";
  const pool = Object.entries(HEROES).filter(([, h]) => h.roles.includes(opts.role));
  const [heroSlug, hero] = pick(pool, pool.filter(([s]) => recentHeroes.includes(s)) as [string, HeroRoast][]);
  const opener = pick(hero.lines[opts.level], recentLines);
  const punch = pick(PUNCHLINES[opts.level], recentLines);
  const closer = pick(ROLE_CLOSERS[opts.role][opts.level], recentLines);

  recentHeroes.push(heroSlug);
  if (recentHeroes.length > 6) recentHeroes.shift();
  recentLines.push(opener, punch, closer);
  while (recentLines.length > 18) recentLines.shift();

  return {
    roast: `${fill(opener, name)}\n\n${fill(punch, name)}\n\n${fill(closer, name)}`,
    title: pick(TITLES[opts.level]),
    hero: hero.display,
    level: opts.level,
  };
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

