/**
 * Put inside <head> in app/layout.tsx. It marks the page as "script enabled" before first paint,
 * so scroll-reveal elements start hidden only when JavaScript is available.
 * Add suppressHydrationWarning to <html> in the same file.
 */
export function MotionInit() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: "document.documentElement.dataset.motion='pending'",
      }}
    />
  );
}
