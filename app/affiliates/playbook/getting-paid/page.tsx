'use client'

import PlaybookGate from '@/components/PlaybookGate'
import { BackToHub, Section } from '@/components/PlaybookUI'

export default function GettingPaidPage() {
  return (
    <PlaybookGate>
      <div className="p-4 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7C3AED] mb-1">Prox connector playbook</p>
          <h1 className="wordmark text-3xl">Getting paid</h1>
        </div>

        <div className="bg-[#7C3AED]/15 border border-[#7C3AED]/40 rounded-xl p-4">
          <p className="text-sm leading-relaxed">
            <strong>Heads up:</strong> the exact commission numbers are being
            finalized. Everything below is how the money moves — the amounts land
            here the day they're locked. Don't quote numbers to anyone until then.
          </p>
        </div>

        <Section title="How the money moves">
          <p>
            Every sale you close drops into your ledger — a running record of what
            you've earned. It is append-only, meaning entries never get edited or
            deleted. What you see is what happened. You can check your balance any
            time from your account.
          </p>
          <p>
            Tier 2 sellers keep the big cut of every $199 sale they close. Tier 1
            recruiters earn a small override on every sale their team closes. Both
            track automatically to your connector code — if the code was on the
            sale, the credit is yours.
          </p>
        </Section>

        <Section title="Payouts">
          <p>
            Money doesn't move on its own. Every payout gets a human review before
            it goes out — that's what keeps the system honest for everyone. Earned
            balances sit in your ledger until payout.
          </p>
          <p>
            If a sale gets refunded, the credit comes back out. That's the deal:
            you get paid on real, kept sales.
          </p>
        </Section>

        <Section title="What to tell people who ask">
          <p>
            "Businesses pay $199 a year. I keep a cut of every one I sign, and it
            tracks automatically. The exact split is being finalized this month —
            I'll send it to you the day it locks."
          </p>
          <p>
            Honest, short, no made-up numbers. Made-up numbers are how you lose a
            team before it starts.
          </p>
        </Section>

        <BackToHub />
      </div>
    </PlaybookGate>
  )
}
