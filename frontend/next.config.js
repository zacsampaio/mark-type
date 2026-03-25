/** @type {import('next').NextConfig} */
function buildContentSecurityPolicy() {
  const isProd = process.env.NODE_ENV === "production";
  const connect = new Set([
    "'self'",
    "https://api.github.com",
    "https://github.com",
    "https://api.openai.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
  ]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const u = new URL(supabaseUrl);
      connect.add(u.origin);
      connect.add(`wss://${u.host}`);
    } catch {
      /* ignore */
    }
  }

  const scriptExtra = isProd ? "" : " 'unsafe-eval'";

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${scriptExtra}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${[...connect].join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://github.com",
    "object-src 'none'",
  ];
  if (isProd) directives.push("upgrade-insecure-requests");

  return directives.join("; ");
}

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(self), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()",
  },
];

const nextConfig = {
  transpilePackages: [
    "@marktype/markdown",
    "@marktype/templates",
    "@marktype/document-styles",
  ],
  async headers() {
    const headersForEnv =
      process.env.NODE_ENV === "production"
        ? securityHeaders
        : securityHeaders.filter((h) => h.key !== "Strict-Transport-Security");

    return [
      {
        source: "/:path*",
        headers: headersForEnv,
      },
    ];
  },
};

module.exports = nextConfig;
