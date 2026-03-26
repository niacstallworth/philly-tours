import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const webappDir = path.join(repoRoot, "webapp");
const assetsDir = path.join(repoRoot, "assets");
const port = Number(process.env.WEBAPP_PORT || 4173);

const app = express();

app.use("/assets", express.static(assetsDir));
app.use(express.static(webappDir));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(webappDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Philly Tours webapp available at http://localhost:${port}`);
});
