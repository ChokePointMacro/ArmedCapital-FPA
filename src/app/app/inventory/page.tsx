"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalInventory } from "@/components/portal/PortalViews";

export default function PortalInventoryPage() {
  return (
    <PortalShell>
      {({ org }) => <PortalInventory orgId={org.id} />}
    </PortalShell>
  );
}
