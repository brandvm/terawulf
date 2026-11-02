// Second entry point: Finsweet Attributes v2 (List, Custom Select, Social
// Share), built to dist/fs-bundle.js. index.ts loads it only on pages that
// use one of those attributes (modules/finsweet-loader.ts), from the same
// pinned release as the main bundle, so the other pages never download it.
import { initFinsweet } from './modules/finsweet';

initFinsweet();
