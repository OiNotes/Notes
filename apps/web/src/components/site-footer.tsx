import { Container } from "./container";

const TOOLS = [
  { name: "NotebookLM" },
  { name: "ChatGPT" },
  { name: "Claude" },
  { name: "Sora" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <span>© {new Date().getFullYear()} Oi/Notes</span>
        <div className="site-footer__tools">
          {TOOLS.map((tool) => (
            <span key={tool.name} className="site-footer__tool">
              {tool.name}
            </span>
          ))}
        </div>
      </Container>
    </footer>
  );
}

