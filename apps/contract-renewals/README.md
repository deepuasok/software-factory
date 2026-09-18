# Contract Renewals

**The decision:** which vendor contracts to renew, renegotiate or let lapse
before the next budget lands.

Built entirely from `@factory/ui`. It exists to prove the factory works on a
domain that has nothing to do with clinical site selection — no part of it was
styled by hand.

```bash
cd ~/Projects/software-factory
npm install
npm run dev --workspace @factory/contract-renewals   # → http://localhost:8822
```

Three screens:

- `/` — the book of contracts: totals, spend release curve, category split,
  vendor map, and a filterable table.
- `/contracts/[id]` — one contract, what each call costs, and the runway.
- `/plan` — the builder. Click a row to cycle renew → renegotiate → drop and
  watch the totals and the curve move.

All data is invented and seeded in `lib/data.ts`. No real vendor, price or date
appears anywhere.
