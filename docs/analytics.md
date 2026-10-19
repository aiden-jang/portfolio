# Analytics

Vercel Web Analytics and Speed Insights report the public portfolio. Both use
`publicAnalyticsUrl` before sending to normalize URLs to the public home page;
scene settings, arbitrary paths, incoming query values and fragments are removed.
Invalid URLs and other hosts are dropped. No paid custom-events feature is enabled.

Vercel → portfolio → Analytics shows traffic; Speed Insights shows performance.
Cloudflare Web Analytics remains excluded for the portfolio to avoid double counting.
These are aggregate, best-effort visitor and performance estimates, not unique people.
