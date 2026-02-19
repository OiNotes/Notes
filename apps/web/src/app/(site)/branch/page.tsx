import type { Metadata } from "next";
import { DecorativeBand } from "@/components/decorative-band";

export const metadata: Metadata = {
  title: "Branch — Engineering | Oi/Notes",
  description: "Exploring the engineering ecosystem. System design, architecture, and technical notes.",
};

export default function BranchPage() {
    return (
        <div className="container" style={{ paddingTop: "var(--space-10)" }}>
            <div className="prose">
                <h1>Branch</h1>
                <p>Exploring the ecosystem...</p>
            </div>
            <DecorativeBand />
        </div>
    );
}
