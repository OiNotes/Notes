export function DecorativeBand() {
  return (
    <section className="decorative-band" aria-hidden="true">
      <div className="decorative-band__glow" />

      {/* Floating decorative elements */}
      <div className="decorative-band__decorations">
        {/* Large gradient orbs */}
        <div className="deco-orb deco-orb--1" />
        <div className="deco-orb deco-orb--2" />
        <div className="deco-orb deco-orb--3" />

        {/* Medium geometric shapes */}
        <div className="deco-shape deco-shape--square" />
        <div className="deco-shape deco-shape--diamond" />
        <div className="deco-shape deco-shape--circle" />

        {/* Small accent dots */}
        <div className="deco-dot deco-dot--1" />
        <div className="deco-dot deco-dot--2" />
        <div className="deco-dot deco-dot--3" />
        <div className="deco-dot deco-dot--4" />

        {/* Mesh gradient overlay */}
        <div className="deco-mesh" />
      </div>

      <div className="decorative-band__glow" />
    </section>
  );
}
