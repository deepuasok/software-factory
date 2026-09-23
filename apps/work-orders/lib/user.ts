/**
 * Who is using the app.
 *
 * A stub, on purpose. Swap the body for the real session lookup when the app
 * is wired to sign-in; nothing else in the app should read the session
 * directly, so this is the only file that changes.
 */

/** What someone is allowed to do. Three levels, and no fourth. */
export type Role = "viewer" | "editor" | "approver";

export type User = {
  id: string;
  name: string;
  /** Two letters for the avatar. Worked out from the name, never stored twice. */
  initials: string;
  role: Role;
};

const SAMPLE_USER: User = {
  id: "u-sample",
  name: "Sample User",
  initials: "SU",
  role: "viewer",
};

/** The person using the app right now. Sample data until sign-in is wired. */
export function currentUser(): User {
  return SAMPLE_USER;
}

/** True when the person may change things. Read it; do not re-derive it. */
export function canEdit(user: User = currentUser()): boolean {
  return user.role === "editor" || user.role === "approver";
}

/** True when the person may approve. Approving is not the same as editing. */
export function canApprove(user: User = currentUser()): boolean {
  return user.role === "approver";
}
