# Ports

One app, one port, so two can run side by side without a fight.

| Port | App |
|------|-----|
| 8820 | `apps/_template` — the starter, not a real app |
| 8821 | `apps/gallery` — the living parts bin |
| 8822 | `apps/contract-renewals` — proof app |
| 8823 | reserved (used locally by an app outside this repo) |
| 8824 | `apps/work-orders` — facilities work order triage, proof app |
| 8825 | `apps/invoice-reconciliation` — supplier invoice reconciliation, proof app |
| 8826+ | next free port for a new app |

Never kill a dev server by port. Kill the process id you started.

