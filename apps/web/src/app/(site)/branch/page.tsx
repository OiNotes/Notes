import { DecorativeBand } from "@/components/decorative-band";

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
