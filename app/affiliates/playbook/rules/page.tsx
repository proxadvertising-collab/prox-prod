'use client'

import PlaybookGate from '@/components/PlaybookGate'
import { BackToHub, Section } from '@/components/PlaybookUI'

export default function RulesPage() {
  return (
    <PlaybookGate>
      <div className="p-4 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7C3AED] mb-1">Prox connector playbook</p>
          <h1 className="wordmark text-3xl">Rules of the road</h1>
        </div>

        <Section title="Keep it clean">
          <p>
            <strong>1. No spam, ever.</strong> Text people you actually know. If
            you're reaching out to someone looking for work, only contact people
            who publicly posted that they're looking — that's an open door, not a
            cold call. Everything else is spam and it burns the brand you're
            trying to build.
          </p>
          <p>
            <strong>2. Say the price out loud.</strong> $199 a year, stated
            upfront, on the first visit. No surprises, no fine print reveals. The
            free first post earns trust — hiding the price kills it.
          </p>
          <p>
            <strong>3. Don't invent numbers.</strong> Commission splits are being
            finalized. Until they lock, the answer is "being finalized, I'll send
            it the day it lands." Quoting a guess as a promise ends badly for
            everyone.
          </p>
          <p>
            <strong>4. Sell what's real.</strong> One live deal per business,
            sorted by distance, free first post. Don't promise features that don't
            exist and don't promise foot traffic you can't guarantee. The product
            is strong enough without fairy tales.
          </p>
          <p>
            <strong>5. No fake anything.</strong> No fake downloads, no fake
            businesses, no gaming your own code. The ledger is append-only and
            payouts get human review — gaming it gets you removed, not paid.
          </p>
          <p>
            <strong>6. Represent the brand.</strong> You're the first human face
            of Prox a business ever meets. Show up like it.
          </p>
        </Section>

        <BackToHub />
      </div>
    </PlaybookGate>
  )
}
