export function themeInitScript(): string {
  return `(() => {
    try {
      document.documentElement.setAttribute('data-theme', 'dark');
    } catch (error) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();`;
}

