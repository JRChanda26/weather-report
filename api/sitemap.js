export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://weather-report-142f.vercel.app/</loc>
    <lastmod>2025-06-17</lastmod>
  </url>
  <url>
    <loc>https://weather-report-142f.vercel.app/details</loc>
  </url>
  <url>
    <loc>https://weather-report-142f.vercel.app/forecast</loc>
  </url>
  <url>
    <loc>https://weather-report-142f.vercel.app/analytic</loc>
  </url>
</urlset>`);
}
