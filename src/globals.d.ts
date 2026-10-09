export {};

declare global {
  interface Window {
    WFC?: {
      staging: boolean;
      dev: boolean;
      devBase: string;
      stag: string;
      // The pinned release tag from the head snippet, or null before the
      // first release.
      release: string | null;
      // Base URL production loads from: the jsDelivr tag, or staging while
      // release is null.
      prod: string;
      // Shared staging cache-buster ("?v=<timestamp>"), so the Embed and the
      // footer loader request the same styles.css URL.
      v?: string;
      // Set before script execution, including when a fallback URL is used.
      source?: string;
    };
    Webflow?: { env?: (mode: string) => boolean };
  }
}
