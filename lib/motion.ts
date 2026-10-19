import type { CSSProperties } from "react";

export const delay = (ms: number) =>
  ({ "--anim-delay": `${ms}ms` }) as CSSProperties;
