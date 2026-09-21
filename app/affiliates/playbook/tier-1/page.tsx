'use client'

import PlaybookGate from '@/components/PlaybookGate'
import { Script, BackToHub, Section } from '@/components/PlaybookUI'

export default function Tier1Page() {
  return (
    <PlaybookGate>
      <div className="p-4 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7C3AED] mb-1">Tier 1 — Recruiter</p>
          <h1 className="wordmark text-3xl">Build a team of sellers</h1>
        </div>

        <Section title="Your job in 30 seconds">
          <p>
            You don't sell businesses. You find the people who do. You recruit
            Tier 2 street sellers, hand them this playbook, and earn a small
            override on every sale your team closes. Ten sellers closing two deals
            a month beats anything you could sell alone.
          </p>
        </Section>

        <Section title="Who makes a great Tier 2">
          <p>Look for people with big warm networks, not sales experience:</p>
          <p>
            • The person who knows every business owner on their block.<br />
            • Bartenders, barbers, gym regulars — people everyone talks to.<br />
            • People posting that they're looking for work. They have time, they
            have a phone, and they have a reason to hustle. If someone is actively
            asking for opportunity, offering them a real one is not spam.
          </p>
          <p>
            Your pitch to a recruit is simple — send this:
          </p>
          <Script>
            {`Real talk: I'm building a small team selling a local deals app to businesses in our area. You start with people you already know — family, friends, your favorite spots.

It's free to start, you keep the big cut of every sale, and there's a full playbook that tells you exactly what to do day one. Want the link?`}
          </Script>
        </Section>

        <Section title="What you give every recruit">
          <p>
            The day someone joins, they get three things from you:
          </p>
          <p>
            1. <strong>This playbook.</strong> Don't explain the job yourself — the
            Tier 2 page does it better. Send the link.<br />
            2. <strong>Your connector code.</strong> Their sales track to them,
            your override tracks to you. No code, no credit.<br />
            3. <strong>One week of attention.</strong> Check in on day 3 and day 7.
            "How many downloads so far?" Most recruits who quit do it in week one
            because nobody asked how it was going.
          </p>
        </Section>

        <Section title="The override">
          <p>
            Every time someone on your team closes a business, you earn a small
            slice on top of their big cut. It is small on purpose — the seller
            does the work, the seller gets the money. Your money comes from volume:
            a team of ten sellers each closing a few deals a month.
          </p>
          <p>
            Exact override numbers are being finalized right now. Don't quote
            numbers to recruits until they're locked — this page updates the day
            they are. Sell the opportunity, not a figure.
          </p>
        </Section>

        <Section title="Worked example — Dre's first 30 days">
          <p>
            <strong>Days 1–10 — recruit.</strong> Dre has 40k followers and posts
            twice about the opportunity. He also replies to five people who posted
            they're job hunting. 12 people take a connector code. He sends every
            one of them this playbook and checks in on day 3.
          </p>
          <p>
            <strong>Days 11–20 — coach.</strong> 7 of the 12 actually start. Dre
            spends his time answering questions and pushing the download-first
            order: "Don't pitch a business until you have 15 downloads." Three of
            them sign their first warm business.
          </p>
          <p>
            <strong>Days 21–30 — compound.</strong> His 7 active sellers have 11
            businesses between them. Dre earned an override on every one without
            pitching a single store himself. His job now: recruit 8 more and keep
            the first 7 selling.
          </p>
        </Section>

        <BackToHub />
      </div>
    </PlaybookGate>
  )
}
