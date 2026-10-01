"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { siteConfig } from "@/config/site";
import {
  saveRecruitRequest, postRecruitToInbox,
  RANK_LADDER, LANES,
  type RecruitRequest, type TournamentEntry, type LeaderboardHero,
} from "@/data/recruits";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full border border-white/12 bg-black/40 px-4 py-3 text-[15px] text-white placeholder:text-white/25 focus:outline-none focus:border-[var(--accent)] [color-scheme:dark]";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label !text-[10px] text-white/40">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

const blankTournament = (): TournamentEntry => ({ name: "", result: "", year: "" });

export default function RecruitPage() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [contactDetail, setContactDetail] = useState("");
  const [email, setEmail] = useState("");
  const [ign, setIgn] = useState("");
  const [uid, setUid] = useState("");
  const [country, setCountry] = useState("");
  const [highestRank, setHighestRank] = useState("");
  const [mainRole, setMainRole] = useState("");
  const [playableRoles, setPlayableRoles] = useState<string[]>([]);
  const [signatureHero, setSignatureHero] = useState("");
  const [heroPool, setHeroPool] = useState("");
  const [previousTeams, setPreviousTeams] = useState("");
  const [tournaments, setTournaments] = useState<TournamentEntry[]>([{ ...blankTournament() }]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardHero[]>([
    { hero: "", rank: "" },
    { hero: "", rank: "" },
    { hero: "", rank: "" },
  ]);
  const [tryoutDate, setTryoutDate] = useState("");
  const [tryoutTime, setTryoutTime] = useState("");
  const [availability, setAvailability] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<RecruitRequest | null>(null);
  const [emailed, setEmailed] = useState<boolean | null>(null);

  const toggleRole = (r: string) =>
    setPlayableRoles((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!fullName.trim()) errs.push("Full name is required.");
    const ageNum = Number(age);
    if (!age.trim() || !Number.isFinite(ageNum) || ageNum < 10 || ageNum > 80) errs.push("A valid age is required.");
    if (!contactDetail.trim()) errs.push("Contact / Discord is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.push("A valid email address is required.");
    if (!ign.trim()) errs.push("IGN is required.");
    if (!uid.trim()) errs.push("UID is required.");
    if (!country.trim()) errs.push("Country is required.");
    if (!highestRank) errs.push("Highest rank is required.");
    if (!mainRole) errs.push("Main role is required.");
    if (playableRoles.length === 0) errs.push("Select at least one playable role.");
    if (!signatureHero.trim()) errs.push("Signature hero is required.");
    if (!tryoutDate) errs.push("Preferred tryout date is required.");
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(`${tryoutDate}T00:00`) < today) errs.push("Tryout date can't be in the past.");
    }
    if (!tryoutTime) errs.push("Preferred tryout time is required.");
    if (!confirmed) errs.push("Please confirm the information is accurate.");
    setErrors(errs);
    if (errs.length) return;

    setSending(true);
    const req = saveRecruitRequest({
      fullName: fullName.trim(),
      age: ageNum,
      contactDetail: contactDetail.trim(),
      email: email.trim(),
      ign: ign.trim(),
      uid: uid.trim(),
      country: country.trim(),
      highestRank,
      mainRole,
      playableRoles,
      signatureHero: signatureHero.trim(),
      heroPool: heroPool.trim(),
      previousTeams: previousTeams.trim(),
      tournaments: tournaments.filter((t) => t.name.trim()).map((t) => ({
        name: t.name.trim(),
        result: t.result.trim() || "—",
        year: t.year.trim() || "—",
      })),
      leaderboard: leaderboard.filter((l) => l.hero.trim()).map((l) => ({
        hero: l.hero.trim(),
        rank: l.rank.trim(),
      })),
      tryoutDate,
      tryoutTime,
      availability: availability.trim(),
    });
    const inbox = siteConfig.contact.recruitInboxEmail || siteConfig.contact.scrimInboxEmail;
    setEmailed(inbox ? await postRecruitToInbox(req, inbox) : null);
    setSending(false);
    setSent(req);
  };

  const reset = () => {
    setFullName(""); setAge(""); setContactDetail(""); setEmail("");
    setIgn(""); setUid(""); setCountry(""); setHighestRank(""); setMainRole("");
    setPlayableRoles([]); setSignatureHero(""); setHeroPool(""); setPreviousTeams("");
    setTournaments([{ ...blankTournament() }]);
    setLeaderboard([{ hero: "", rank: "" }, { hero: "", rank: "" }, { hero: "", rank: "" }]);
    setTryoutDate(""); setTryoutTime(""); setAvailability("");
    setConfirmed(false); setErrors([]); setSent(null); setEmailed(null);
  };

  return (
    <>
      <PageHero
        index="16"
        label="Compete"
        title="JOIN THE SQUAD."
        sub="Think you have what it takes to compete with EUPHEX? Submit your details below and our recruitment team will review your application."
        image={SECTION_BG.teams}
      />
      <div className="mx-auto max-w-[860px] px-5 md:px-10 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="border border-[var(--accent)]/40 bg-[#0C0F16] p-8 md:p-12 text-center"
              role="status"
            >
              <p className="label text-[var(--accent)]">Application received</p>
              <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
                GOOD LUCK, {sent.ign.toUpperCase()}.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/60">
                {sent.fullName} — {sent.mainRole} · tryout {sent.tryoutDate} at {sent.tryoutTime} (GMT+05:00).
                Selected applicants will be contacted through the details provided.
                {emailed === true && " A copy was also sent straight to our inbox."}
                {emailed === false && (
                  <>
                    {" "}
                    Auto-delivery missed — please email us directly at{" "}
                    <a
                      href={`mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(`Recruitment: ${sent.fullName} (${sent.ign}) — REF ${sent.id.toUpperCase()}`)}`}
                      className="font-semibold text-white underline underline-offset-4 hover:text-[var(--accent)]"
                    >
                      {siteConfig.contact.email}
                    </a>
                    .
                  </>
                )}
              </p>
              <p className="mt-4 inline-block border border-white/12 bg-black/40 px-4 py-2 font-mono text-xs tracking-[0.14em] text-white/60">
                REF: {sent.id.toUpperCase()}
              </p>
              <div className="mt-8">
                <button
                  onClick={reset}
                  className="border border-white/15 px-8 py-3.5 text-xs font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] cursor-pointer transition-colors"
                >
                  New application →
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submit}
              noValidate
              className="space-y-10"
            >
              <section aria-label="Personal information">
                <p className="label text-[var(--accent)] mb-5">01 — Personal information</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ahmed Naseem" maxLength={80} className={inputCls} />
                  </Field>
                  <Field label="Age">
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 19" min={10} max={80} className={inputCls} />
                  </Field>
                  <Field label="Contact / Discord">
                    <input value={contactDetail} onChange={(e) => setContactDetail(e.target.value)} placeholder="e.g. +960 … or ahmed#1234" maxLength={80} className={inputCls} />
                  </Field>
                  <Field label="Email Address">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" maxLength={120} className={inputCls} />
                  </Field>
                </div>
              </section>

              <section aria-label="Mobile Legends information">
                <p className="label text-[var(--accent)] mb-5">02 — Mobile Legends information</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="IGN (In-Game Name)">
                    <input value={ign} onChange={(e) => setIgn(e.target.value)} placeholder="e.g. Nawrrr" maxLength={40} className={inputCls} />
                  </Field>
                  <Field label="UID">
                    <input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="e.g. 12345678" maxLength={30} className={inputCls} />
                  </Field>
                  <Field label="Country">
                    <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Maldives" maxLength={60} className={inputCls} />
                  </Field>
                  <Field label="Highest Rank">
                    <select value={highestRank} onChange={(e) => setHighestRank(e.target.value)} className={cn(inputCls, "[&>option]:bg-black", !highestRank && "text-white/25")}>
                      <option value="">Select rank…</option>
                      {RANK_LADDER.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Main Role">
                    <select value={mainRole} onChange={(e) => setMainRole(e.target.value)} className={cn(inputCls, "[&>option]:bg-black", !mainRole && "text-white/25")}>
                      <option value="">Select one…</option>
                      {LANES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Signature Hero">
                    <input value={signatureHero} onChange={(e) => setSignatureHero(e.target.value)} placeholder="e.g. Fanny" maxLength={40} className={inputCls} />
                  </Field>
                </div>
                <fieldset className="mt-5">
                  <legend className="label !text-[10px] text-white/40 mb-2">Roles you can play</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {LANES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        role="checkbox"
                        aria-checked={playableRoles.includes(r)}
                        onClick={() => toggleRole(r)}
                        className={cn(
                          "border px-2 py-2.5 text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer transition-all",
                          playableRoles.includes(r)
                            ? "border-[var(--accent)] bg-[var(--accent)]/15 text-white"
                            : "border-white/12 text-white/50 hover:text-white hover:border-white/30",
                        )}
                      >
                        {r.replace(" Lane", "")}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-5">
                  <Field label="Hero Pool" hint="One hero per line, or comma separated.">
                    <textarea value={heroPool} onChange={(e) => setHeroPool(e.target.value)} rows={3} maxLength={1000} placeholder={"Fanny\nLing\nHayabusa"} className={inputCls} />
                  </Field>
                </div>
              </section>

              <section aria-label="Competitive experience">
                <p className="label text-[var(--accent)] mb-5">03 — Competitive experience</p>
                <Field label="Previous Team / Organization" hint="Enter previous team names.">
                  <textarea value={previousTeams} onChange={(e) => setPreviousTeams(e.target.value)} rows={2} maxLength={500} placeholder="Optional…" className={inputCls} />
                </Field>
                <div className="mt-5">
                  <p className="label !text-[10px] text-white/40 mb-2">Previous tournament experience</p>
                  <div className="space-y-3">
                    {tournaments.map((t, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_110px_auto] gap-2 items-end border border-white/10 bg-black/30 p-3">
                        <input value={t.name} onChange={(e) => setTournaments(tournaments.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Tournament" aria-label={`Tournament ${i + 1} name`} className={cn(inputCls, "!py-2.5 !text-sm")} />
                        <input value={t.result} onChange={(e) => setTournaments(tournaments.map((x, j) => (j === i ? { ...x, result: e.target.value } : x)))} placeholder="Placement" aria-label={`Tournament ${i + 1} placement`} className={cn(inputCls, "!py-2.5 !text-sm")} />
                        <input value={t.year} onChange={(e) => setTournaments(tournaments.map((x, j) => (j === i ? { ...x, year: e.target.value } : x)))} placeholder="Year" aria-label={`Tournament ${i + 1} year`} className={cn(inputCls, "!py-2.5 !text-sm")} />
                        <button
                          type="button"
                          onClick={() => setTournaments(tournaments.filter((_, j) => j !== i))}
                          aria-label={`Remove tournament ${i + 1}`}
                          className="inline-flex size-10 items-center justify-center border border-white/12 text-white/50 hover:text-red-300 hover:border-red-400/50 cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTournaments([...tournaments, blankTournament()])}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-dashed border-white/20 px-4 py-3 text-[12px] font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white hover:border-[var(--accent)] cursor-pointer transition-colors"
                  >
                    <Plus className="size-4" /> Add tournament
                  </button>
                </div>
                <div className="mt-5">
                  <p className="label !text-[10px] text-white/40 mb-2">Maldives leaderboard heroes (up to 3)</p>
                  <div className="space-y-2">
                    {leaderboard.map((l, i) => (
                      <div key={i} className="grid grid-cols-[1fr_110px] gap-2">
                        <input value={l.hero} onChange={(e) => setLeaderboard(leaderboard.map((x, j) => (j === i ? { ...x, hero: e.target.value } : x)))} placeholder={`Hero ${i + 1}`} aria-label={`Leaderboard hero ${i + 1}`} className={cn(inputCls, "!py-2.5 !text-sm")} />
                        <input value={l.rank} onChange={(e) => setLeaderboard(leaderboard.map((x, j) => (j === i ? { ...x, rank: e.target.value } : x)))} placeholder="# rank" aria-label={`Leaderboard hero ${i + 1} rank`} className={cn(inputCls, "!py-2.5 !text-sm")} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section aria-label="Tryout schedule">
                <p className="label text-[var(--accent)] mb-5">04 — Tryout schedule</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Preferred Tryout Date">
                    <input type="date" value={tryoutDate} onChange={(e) => setTryoutDate(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Preferred Tryout Time">
                    <input type="time" value={tryoutTime} onChange={(e) => setTryoutTime(e.target.value)} className={inputCls} />
                  </Field>
                  <div>
                    <span className="label !text-[10px] text-white/40">Time Zone</span>
                    <p className="mt-1.5 border border-white/12 bg-black/40 px-4 py-3 text-[15px] text-white/70">GMT +05:00 — Maldives</p>
                  </div>
                </div>
                <div className="mt-5">
                  <Field label="Availability Notes" hint="Any additional information about your availability…">
                    <textarea value={availability} onChange={(e) => setAvailability(e.target.value)} rows={3} maxLength={1000} placeholder="Optional…" className={inputCls} />
                  </Field>
                </div>
              </section>

              <section aria-label="Submit application" className="border border-white/10 bg-[#0C0F16] p-5 md:p-6">
                <p className="label text-[var(--accent)] mb-4">05 — Submit application</p>
                <p className="text-sm leading-relaxed text-white/60">
                  Before submitting: make sure all information provided is accurate. Selected applicants will be
                  contacted through the contact information provided above.
                </p>
                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 size-4 shrink-0 accent-[#E3256B]"
                  />
                  <span className="text-sm font-semibold">Everything above is accurate to the best of my knowledge.</span>
                </label>
                <p className="mt-4 border-t border-white/8 pt-4 text-xs leading-relaxed text-white/45">
                  Tryout dates and times are subject to team availability. Any necessary changes, confirmations,
                  or additional information regarding the tryout will be communicated to the applicant through
                  the contact details provided.
                </p>
              </section>

              {errors.length > 0 && (
                <div className="border border-red-400/40 bg-red-400/5 p-5" role="alert">
                  <p className="label !text-[10px] text-red-300 mb-2">Fix {errors.length} thing{errors.length > 1 ? "s" : ""}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-white/75">
                    {errors.map((er) => (
                      <li key={er}>{er}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[var(--accent)] py-5 text-sm font-bold tracking-[0.2em] uppercase clip-slant hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
              >
                {sending ? "Sending…" : "Submit application →"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
