/**
 * The only writer of Activity.
 *
 * Activity is append-only: nothing updates a row, nothing deletes one. Route
 * handlers call `recordChange` after the change has committed. If you find
 * yourself reaching for `prisma.activity.create` anywhere else, the call
 * belongs here instead.
 */

import { prisma } from "./db";
import { currentUser } from "./user";

/** What happened. Verbs, in the past tense, and no synonyms. */
export type AuditVerb =
  | "created"
  | "updated"
  | "deleted"
  | "submitted"
  | "approved"
  | "rejected"
  | "commented"
  | "attached"
  | "overrode"
  | "exported";

export type ChangeRecord = {
  /** The domain model's name, spelled the way the schema spells it. */
  entityType: string;
  entityId: string;
  verb: AuditVerb;
  actorId?: string;
  /** The field that moved, when one field moved. */
  field?: string;
  from?: unknown;
  to?: unknown;
  /** Anything else worth keeping. Kept as JSON; never queried on. */
  meta?: Record<string, unknown>;
};

/** Write one line of history. Call it after the change has committed. */
export async function recordChange(change: ChangeRecord) {
  const actorId = change.actorId ?? currentUser().id;
  return prisma.activity.create({
    data: {
      entityType: change.entityType,
      entityId: change.entityId,
      verb: change.verb,
      actorId,
      field: change.field ?? null,
      fromValue: change.from === undefined ? undefined : (change.from as never),
      toValue: change.to === undefined ? undefined : (change.to as never),
      meta: change.meta === undefined ? undefined : (change.meta as never),
    },
  });
}

/**
 * Write one line per field that actually moved.
 *
 * Use it on a form save, so the history reads "changed owner" rather than
 * "updated record". Fields whose value did not change are skipped.
 */
export async function recordFieldChanges(
  base: Omit<ChangeRecord, "verb" | "field" | "from" | "to">,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const moved = Object.keys(after).filter((k) => !Object.is(before[k], after[k]));
  for (const field of moved) {
    await recordChange({ ...base, verb: "updated", field, from: before[field], to: after[field] });
  }
  return moved;
}

/** The history of one record, newest first. Read-only, like everything here. */
export function readHistory(entityType: string, entityId: string, take = 50) {
  return prisma.activity.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
