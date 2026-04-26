import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCityPack } from "./lib/city-pack.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const distDir = path.join(repoRoot, "web-dist");
const port = Number(process.env.WEBAPP_PORT || 4173);
const cityPack = loadCityPack(repoRoot);

const app = express();

app.use(express.static(distDir));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`${cityPack.city.name} webapp available at http://localhost:${port}`);
});
