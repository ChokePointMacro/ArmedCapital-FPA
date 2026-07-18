"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PortalPipeline } from "@/components/portal/PortalViews";

export default function PortalPipelinePage() {
  return (
    <PortalShell>
      {({ org }) => <PortalPipeline orgId={org.id} />}
    </PortalShell>
  );
}
