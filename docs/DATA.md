# Data

What `apps/_template` gives an app before anyone writes a line of it: seven
cross-cutting tables, one client for its own routes, one writer of history, and
one place that knows who is signed in. Copy the template and these come with
it.

Contract section 6 is the rule underneath all of it: every domain record has
`id`, `createdAt`, `updatedAt` and `createdBy`, and the cross-cutting models
are polymorphic on `(entityType, entityId)` with real `Json` columns.

---

## The seven models

`apps/_template/prisma/schema.prisma`. They are polymorphic on
`(entityType, entityId)`: `entityType` is the domain model's name spelled the
way the schema spells it, `entityId` is that record's id. That is why a
comment, an override or an attachment never needs a new table when a new
domain model arrives. Every one of them is indexed on the pair.

| Model | What it holds | Worth knowing |
|---|---|---|
| `Comment` | What a person said about a record. | Threaded one level through `parentId`, never two. `resolvedAt` closes a thread without deleting it. |
| `Activity` | What happened to a record. | **Append-only.** Nothing updates a row, nothing deletes one. Written only through `lib/audit.ts`. `fromValue` and `toValue` are `Json`, so a moved field keeps both sides. Indexed on `createdAt` as well, because the feed is read newest-first. |
| `Override` | A figure a person replaced by hand. | `reasonText` is not optional — that is the whole point of the table. `originalValue` keeps what the model said. `expiresAt` lets an override lapse instead of being forgotten. |
| `Attachment` | A file somebody attached. | The bytes live in object storage; `storageKey` points at them. The row is the metadata only. |
| `StatusHistory` | Every status a record has held, and who moved it. | `fromStatus` is null on the first row. Pairs with `StatusStepper` on screen. |
| `SavedView` | A named filter and sort people come back to. | `entityId` is `""` for a whole list rather than one record. `shared` decides whether other people see it. Pairs with the `SavedViews` part. |
| `SourceAttribution` | Where a figure came from. | One row per field, per source. `confidence` is optional; `observedAt` is not. Pairs with `SourceBadge` and `AsOf` on screen. |

Domain models go below the marker at the bottom of the schema, and carry
nothing cross-cutting. If a domain model is growing a `comment` column or a
`lastChangedBy`, the answer is one of the seven above.

The template is on SQLite through `DATABASE_URL`. Swap the datasource provider
for Postgres and nothing else in the schema changes.

```bash
npm run db:generate --workspace @factory/app-template   # prisma generate
npm run db:migrate  --workspace @factory/app-template   # prisma migrate dev
```

---

## `lib/db.ts` — the one client

A single `PrismaClient`, stashed on `globalThis`. Next reloads modules on every
save in development, and a plain `new PrismaClient()` at module scope opens a
new pool each time until the database runs out of handles. Import `prisma`
from here and never construct a client anywhere else.

---

## Routes

Route handlers live at `app/api/<collection>/route.ts` and export the verbs
they answer. The template ships none, because a route with no domain model
behind it is a guess; `apps/session-desk/app/api/*/route.ts` is the worked
example.

The shape, so that `lib/api.ts` on the other side never has to special-case
anything:

```ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { recordChange } from "../../../lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ records: await prisma.record.findMany() });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ message: "A name is required." }, { status: 400 });
  }
  const record = await prisma.record.create({ data: body });
  await recordChange({ entityType: "Record", entityId: record.id, verb: "created" });
  return NextResponse.json({ record }, { status: 201 });
}
```

Three rules:

1. **JSON in, JSON out.** An object at the top level, never a bare array — a
   list that later needs a total has nowhere to put it.
2. **Refuse with `{ message }` and a status.** `lib/api.ts` reads `message`
   and shows it. Anything else it can only render as "The request failed".
3. **Audit after the commit, in the route.** Never inside a Prisma hook, and
   never from the client.

---

## `lib/api.ts` — the client's way of talking to its own routes

`"use client"`. Four verbs — `get`, `post`, `put`, `del` — over one `request`
helper, so every screen sends the same headers and fails the same way.

- **`ApiError`** carries `status`, `message` and the parsed `body`. Show
  `message`; log the rest. A non-JSON body comes back as the raw text rather
  than throwing a second time.
- **`useOptimistic(initial)`** returns `{ value, setValue, apply, saving, error }`.
  `apply(next, save)` paints the change immediately and puts the old value back
  if the save throws. Use it wherever people nudge a figure and expect the
  screen to react. Do **not** use it for creating a record: a new row that
  appears and then vanishes is worse than a short wait.

---

## `lib/audit.ts` — the only writer of `Activity`

```ts
await recordChange({ entityType: "Contract", entityId: id, verb: "approved" });
```

- **`AuditVerb`** is a closed list: `created`, `updated`, `deleted`,
  `submitted`, `approved`, `rejected`, `commented`, `attached`, `overrode`,
  `exported`. Past tense, no synonyms. A feed that says both "updated" and
  "modified" is two vocabularies.
- **`recordChange(change)`** writes one line. `from` and `to` are stored as
  `fromValue` and `toValue`. The actor defaults to `currentUser().id`.
- **`recordFieldChanges(base, before, after)`** writes one line per field that
  actually moved, so the history reads "changed owner" rather than "updated
  record". Unchanged fields are skipped.
- **`readHistory(entityType, entityId, take)`** reads one record's history,
  newest first. It feeds the `ActivityFeed` part directly.

If you find yourself reaching for `prisma.activity.create`, the call belongs
in this file instead.

---

## `lib/user.ts` — who is using the app

A deliberate stub. `currentUser()` returns a sample `User` with `id`, `name`,
`initials` and `role`. Swap the body for the real session lookup when sign-in
is wired; nothing else in the app reads the session, so this is the only file
that changes.

- **`Role`** is `viewer | editor | approver`. Three levels and no fourth.
- **`canEdit(user?)`** — true for editor and approver.
- **`canApprove(user?)`** — true for approver only. Approving is not the same
  as editing, and an app that conflates them will eventually let the person who
  wrote the number sign it off.

Read these two helpers. Do not re-derive the rule from `role` at a call site.

---

## `lib/format.ts` — how figures are written

Not data, but it belongs in the same breath: every number on screen goes
through `money`, `pct`, `compact`, `relativeTime` or `delta`, so a total in a
tile and the same total in a table never disagree about rounding. Never call
`toLocaleString` in a component.
