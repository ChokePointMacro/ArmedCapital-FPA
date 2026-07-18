"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalOverview } from "@/components/portal/PortalViews";

export default function PortalHome() {
  return (
    <PortalShell>
      {({ org }) => <PortalOverview orgId={org.id} />}
    </PortalShell>
  );
}
