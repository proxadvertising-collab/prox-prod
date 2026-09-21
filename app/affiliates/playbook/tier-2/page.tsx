'use client'

import PlaybookGate from '@/components/PlaybookGate'
import { Script, BackToHub, Section } from '@/components/PlaybookUI'

export default function Tier2Page() {
  return (
    <PlaybookGate>
      <div className="p-4 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7C3AED] mb-1">Tier 2 — Street seller</p>
          <h1 className="wordmark text-3xl">Sell to businesses you know</h1>
        </div>

        <Section title="Your job in 30 seconds">
          <p>
            You sign up local businesses at $199 a year. You start with people you
            already know — family, friends, the spots you already spend money at.
            You keep the big cut of every sale. Warm first, cold later, once you
            have proof it works.
          </p>
        </Section>

        <Section title="Step 1 — Get the downloads (do this first)">
          <p>
            <strong>Why:</strong> a business buys an audience, not an app. When you
            walk into your cousin's salon and say "60 people within two miles
            already have Prox," you are not pitching. You are reporting. That is
            the whole game.
          </p>
          <p>
            <strong>How:</strong> make a list of 30 people. Friends, family,
            coworkers, group chats. Text them one by one — not a mass blast, a
            real text. Copy, paste, send:
          </p>
          <Script>
            {`Hey! Quick favor — can you download this free app Prox? It shows live deals near you, sorted by how close they are. Takes 30 seconds and it helps me out big time.

[your link]`}
          </Script>
          <p>
            When someone asks "what is it," keep it to one line: "It's like a live
            map of deals around you. Free. No card, no catch."
          </p>
          <p>
            People who don't download after the first text get one follow-up three
            days later, then you move on. Never argue anyone into a free app. Your
            list of 30 should get you 15 to 20 downloads. That is enough to start.
          </p>
        </Section>

        <Section title="Step 2 — Sell to warm businesses">
          <p>
            <strong>Why warm first:</strong> your cousin will forgive your first
            pitch. A stranger won't. You need three or four practice reps before
            you walk into a cold business, and the people who love you are the
            practice field.
          </p>
          <p>
            <strong>The foot in the door:</strong> the first post is free. No card.
            That is not a discount, it is the whole strategy. You are not asking
            for $199. You are asking for ten minutes to put their deal in front of
            the neighbors who already downloaded the app.
          </p>
          <p>The talk track. In person beats text for this one:</p>
          <Script>
            {`You know that app I had you download? Businesses can post one live deal on it — like "20% off today" — and everyone nearby sees it sorted by distance.

Your first post is free, no card. Let me put one up for you right now, takes ten minutes. If it brings people in, it's $199 for the whole year after that. If it doesn't, you delete it and we're good.`}
          </Script>
          <p>
            Say the price out loud on the first visit. $199 a year, stated upfront,
            no surprises later. The free post earns trust. The upfront price keeps it.
          </p>
          <p>
            <strong>"Let me think about it":</strong> fine. Leave them with one
            line — "The free post is sitting there whenever you want it, just text
            me" — and follow up in a week. Half your sales close on the follow-up.
          </p>
        </Section>

        <Section title="Worked example — Maya's first two weeks">
          <p>
            <strong>Week 1 — downloads.</strong> Maya lists 30 people: her sisters,
            her gym group chat, coworkers, her neighbor. She texts them one by one
            with the script above. 18 download it. She now has a real audience in
            her neighborhood.
          </p>
          <p>
            <strong>Week 2 — businesses.</strong> Her cousin owns a salon. Her
            brother runs a food truck. Her best friend manages a coffee shop. She
            visits all three with the talk track. The salon and the food truck say
            yes to the free post on the spot. The coffee shop says "let me think
            about it" — she follows up the next week and they say yes.
          </p>
          <p>
            <strong>The result:</strong> three live deals in her neighborhood, all
            from people she already knew. Her download crew sees the deals, foot
            traffic moves, and now she has proof to walk into cold businesses with.
            Every renewal and every new sale after that tracks to her code.
          </p>
        </Section>

        <BackToHub />
      </div>
    </PlaybookGate>
  )
}
