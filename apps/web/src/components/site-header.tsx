import Link from "next/link";
import { Container } from "./container";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link href="/" className="brand" aria-label="Oi/Notes — на главную">
          <span className="brand__mark" aria-hidden="true">
            Oi
          </span>
          <span className="brand__text">Notes</span>
        </Link>
      </Container>
    </header>
  );
}
