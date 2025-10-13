const router = require("express").Router();
const fs = require("fs");
const path = require("path");

router.get("/sitemap.xml", (req, res) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${process.env.FRONTEND_URL}</loc></url></urlset>`;
  res.type("application/xml").send(sitemap);
});

router.get("/robots.txt", (req, res) => {
  res.type("text/plain").send("User-agent: *\nAllow: /");
});

module.exports = router;