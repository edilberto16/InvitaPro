import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Transitional baseline for existing InvitaPro code.
      // Keep these findings visible in local/CI output without blocking
      // validation while we refactor them incrementally in isolated branches.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
  {
    // These screens render signed Supabase media, user-provided media, or
    // externally generated QR images. Their hosts are dynamic at runtime, so
    // forcing next/image would require broad remotePatterns and can break
    // previews when the URL host changes. Keep native <img> intentionally.
    files: [
      "app/admin/album/page.tsx",
      "app/admin/biblioteca/page.tsx",
      "app/admin/invitaciones/page.tsx",
      "app/invitacion/[slug]/[codigo]/page.tsx",
      "app/invitacion/[slug]/page.tsx",
      "app/mi-cuenta/album/page.tsx",
      "app/mi-cuenta/biblioteca/page.tsx",
      "app/mi-cuenta/studio/[id]/page.tsx",
      "components/media/media-library-picker.tsx",
      "components/share-center-modal.tsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);
