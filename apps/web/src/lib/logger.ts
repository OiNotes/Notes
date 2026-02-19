const isDev = process.env.NODE_ENV !== 'production';

export const log = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export const warn = (...args: unknown[]) => {
  if (isDev) {
    console.warn(...args);
  }
};
