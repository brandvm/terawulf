export {};

declare global {
  interface Window {
    WFC?: {
      staging: boolean;
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
      // Piece 1: called when the release stylesheet fails to load.
      releaseCSSFailed?: () => void;
      // True once that happened: 2b and the footer keep the staging sheet.
      cssFallback?: boolean;
      // Set before script execution, including when a fallback URL is used.
      source?: string;
    };
    Webflow?: { env?: (mode: string) => boolean };
  }
}
