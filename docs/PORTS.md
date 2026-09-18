# Ports

One app, one port, so two can run side by side without a fight.

| Port | App |
|------|-----|
| 8820 | `apps/_template` — the starter, not a real app |
| 8821 | `apps/gallery` — the living parts bin |
| 8822 | `apps/contract-renewals` — proof app |
| 8823 | `apps/session-desk` — chat with every running Claude session |
| 8824+ | next free port for a new app |

Never kill a dev server by port. Kill the process id you started.
