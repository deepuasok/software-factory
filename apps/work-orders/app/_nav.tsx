"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@factory/ui";

const ROUTES = [
  { href: "/", label: "Dashboard" },
  { href: "/triage", label: "Triage" },
  { href: "/approvals", label: "Approvals" },
  { href: "/board", label: "Board" },
  { href: "/readout", label: "Readout" },
];

/**
 * The five routes, reachable from every screen. Not a part — plain
 * composition of `Button` and `Link`, the same pattern contract-renewals uses
 * for its own page-to-page links.
 *
 * The current route is `secondary`, never `primary`. Primary means "the one
 * action this page wants from you", and on every screen here that is Save
 * override or Approve — not "you are already on this tab".
 */
export function WorkOrderNav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1.5">
      {ROUTES.map((r) => (
        <Link key={r.href} href={r.href}>
          <Button variant={pathname === r.href ? "secondary" : "ghost"} size="sm">
            {r.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
