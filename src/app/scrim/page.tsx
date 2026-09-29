"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { siteConfig } from "@/config/site";
import { saveScrimRequest, postToInbox, type ScrimMatchType, type ScrimRequest } from "@/data/scrims";
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

const empty = {
  teamName: "",
  teamTag: "",
  contactPerson: "",
  contactDetail: "",
  email: "",
  date: "",
  time: "",
  matchType: "BO3" as ScrimMatchType,
  notes: "",
};

export default function ScrimPage() {
  const [form, setForm] = useState({ ...empty });
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<ScrimRequest | null>(null);
  const [emailed, setEmailed] = useState<boolean | null>(null);

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!form.teamName.trim()) errs.push("Team name is required.");
    if (!form.teamTag.trim()) errs.push("Team tag is required.");
    if (!form.contactPerson.trim()) errs.push("Contact person is required.");
    if (!form.contactDetail.trim()) errs.push("Contact number / Discord ID is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.push("A valid email address is required.");
    if (!form.date) errs.push("Preferred date is required.");
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(`${form.date}T00:00`) < today) errs.push("Preferred date can't be in the past.");
    }
    if (!form.time) errs.push("Preferred time is required.");
    if (!confirmed) errs.push("Please confirm the information is correct.");
    setErrors(errs);
    if (errs.length) return;

    setSending(true);
    const req = saveScrimRequest({
      teamName: form.teamName.trim(),
      teamTag: form.teamTag.trim(),
      contactPerson: form.contactPerson.trim(),
      contactDetail: form.contactDetail.trim(),
      email: form.email.trim(),
      date: form.date,
      time: form.time,
      matchType: form.matchType,
      notes: form.notes.trim(),
    });
    const inbox = siteConfig.contact.scrimInboxEmail;
    setEmailed(inbox ? await postToInbox(req, inbox) : null);
    setSending(false);
    setSent(req);
  };

  const reset = () => {
    setForm({ ...empty });
    setConfirmed(false);
    setErrors([]);
    setSent(null);
    setEmailed(null);
  };

  return (
    <>
      <PageHero
        index="15"
        label="Compete"
        title="REQUEST A SCRIM."
        sub="Think your squad can hang with us? Send the details — we review every request against team availability and schedule."
        image={SECTION_BG.matches}
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
              <p className="label text-[var(--accent)]">Request received</p>
              <h2 className="font-display mt-3 text-4xl md:text-5xl font-bold tracking-tight">
                WE&apos;LL BE IN TOUCH.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/60">
                {sent.teamName} ({sent.teamTag}) — {sent.matchType} on {sent.date} at {sent.time}.
                {emailed === true && " A copy was also sent straight to our inbox."}
                {emailed === false && " Saved on this device — our team will confirm by email."}
              </p>
              <p className="mt-4 inline-block border border-white/12 bg-black/40 px-4 py-2 font-mono text-xs tracking-[0.14em] text-white/60">
                REF: {sent.id.toUpperCase()}
              </p>
              <div className="mt-8">
                <button
                  onClick={reset}
                  className="border border-white/15 px-8 py-3.5 text-xs font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] cursor-pointer transition-colors"
                >
                  New request →
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
              <section aria-label="Team information">
                <p className="label text-[var(--accent)] mb-5">01 — Team information</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Team Name">
                    <input value={form.teamName} onChange={(e) => set("teamName", e.target.value)} placeholder="e.g. Night Owls" maxLength={60} className={inputCls} />
                  </Field>
                  <Field label="Team Tag">
                    <input value={form.teamTag} onChange={(e) => set("teamTag", e.target.value)} placeholder="e.g. NOW" maxLength={12} className={inputCls} />
                  </Field>
                  <Field label="Contact Person — Name / IGN">
                    <input value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="e.g. Ahmed / AhmedPlays" maxLength={60} className={inputCls} />
                  </Field>
                  <Field label="Contact Number / Discord ID">
                    <input value={form.contactDetail} onChange={(e) => set("contactDetail", e.target.value)} placeholder="e.g. +960 … or ahmed#1234" maxLength={80} className={inputCls} />
                  </Field>
                  <Field label="Email Address">
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@team.gg" maxLength={120} className={cn(inputCls, "sm:col-span-2")} />
                  </Field>
                </div>
              </section>

              <section aria-label="Scrim details">
                <p className="label text-[var(--accent)] mb-5">02 — Scrim details</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field label="Preferred Date">
                    <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Preferred Time">
                    <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Match Type">
                    <select value={form.matchType} onChange={(e) => set("matchType", e.target.value as ScrimMatchType)} className={cn(inputCls, "[&>option]:bg-black")}>
                      {(["BO3", "BO5", "BO7"] as ScrimMatchType[]).map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>

              <section aria-label="Additional information">
                <p className="label text-[var(--accent)] mb-5">03 — Additional information</p>
                <Field label="Notes / Special Requests" hint="Roster size, rules, stream permission — anything we should know.">
                  <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={4} maxLength={1000} placeholder="Optional…" className={inputCls} />
                </Field>
              </section>

              <section aria-label="Confirmation" className="border border-white/10 bg-[#0C0F16] p-5 md:p-6">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 size-4 shrink-0 accent-[#E3256B]"
                  />
                  <span className="text-sm font-semibold">I confirm that the information provided is correct.</span>
                </label>
                <p className="mt-4 border-t border-white/8 pt-4 text-xs leading-relaxed text-white/45">
                  Please note: all scrim requests are subject to acceptance or rejection based on
                  EUPHEX&apos;s team availability and schedule.
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
                {sending ? "Sending…" : "Submit request →"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
