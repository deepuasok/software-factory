"use client";

import { AppShell, Button, EmptyState, PageHeader } from "@factory/ui";

export default function Home() {
  return (
    <AppShell product="App Name">
      <PageHeader
        title="Records"
        subtitle="Replace this with the list the app is actually about."
        actions={<Button variant="primary">+ New record</Button>}
      />
      <EmptyState
        title="Nothing here yet"
        body="Say what the first record is and give the one button that creates it."
        action={<Button variant="primary">+ New record</Button>}
      />
    </AppShell>
  );
}
