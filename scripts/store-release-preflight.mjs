import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");

const checks = [];
const warnings = [];

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function pass(label) {
  checks.push({ ok: true, label });
}

function fail(label, detail) {
  checks.push({ ok: false, label, detail });
}

function warn(label, detail) {
  warnings.push({ label, detail });
}

function expect(label, condition, detail) {
  if (condition) {
    pass(label);
  } else {
    fail(label, detail);
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function stripXml(text) {
  return text.replace(/\s+/g, " ");
}

function extractGroovyBlock(text, blockName, startIndex = 0) {
  const nameIndex = text.indexOf(blockName, startIndex);
  if (nameIndex < 0) {
    return "";
  }
  const openIndex = text.indexOf("{", nameIndex);
  if (openIndex < 0) {
    return "";
  }

  let depth = 0;
  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(openIndex + 1, index);
      }
    }
  }

  return "";
}

function getListedFiles() {
  const output = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isTextFile(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower.includes("node_modules/") || lower.includes("vendor-sdk/") || lower.includes("web-dist/")) {
    return false;
  }
  if (lower.includes(".env") && !lower.endsWith(".env.example")) {
    return false;
  }
  return /\.(cjs|css|csv|gradle|html|js|json|kt|md|mjs|plist|properties|sh|tsx?|txt|xml|yml|yaml)$/i.test(lower);
}

function checkSecretPatterns() {
  const secretPatterns = [
    { name: "Google API key", regex: /AIza[0-9A-Za-z_-]{35}/g },
    { name: "Stripe live secret", regex: /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}\b/g },
    { name: "Stripe webhook secret", regex: /\bwhsec_[0-9A-Za-z]{16,}\b/g },
    { name: "AWS access key", regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
    { name: "private key block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g }
  ];
  const findings = [];

  for (const relativePath of getListedFiles()) {
    if (!isTextFile(relativePath)) {
      continue;
    }
    const text = readText(relativePath);
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const pattern of secretPatterns) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(line)) {
          findings.push(`${relativePath}:${index + 1} (${pattern.name})`);
        }
      }
    });
  }

  expect(
    "No obvious committed secret values in tracked or new source files",
    findings.length === 0,
    findings.length ? findings.join("\n") : undefined
  );
}

function checkNativeMetadata() {
  const appConfig = readJson("app.json").expo;
  const packageJson = readJson("package.json");
  const iosInfo = readText("ios/PhillyARTours/Info.plist");
  const iosInfoFlat = stripXml(iosInfo);
  const androidStrings = readText("android/app/src/main/res/values/strings.xml");
  const androidManifest = readText("android/app/src/main/AndroidManifest.xml");
  const androidBuild = readText("android/app/build.gradle");
  const buildTypesBlock = extractGroovyBlock(androidBuild, "buildTypes");
  const releaseBuildBlock = extractGroovyBlock(buildTypesBlock, "release");

  expect("Expo app name is store-facing Philly Tours", appConfig.name === "Philly Tours", `Found ${appConfig.name}`);
  expect("Package and Expo versions match", packageJson.version === appConfig.version, `package.json=${packageJson.version}, app.json=${appConfig.version}`);
  expect("iOS bundle identifier is set", appConfig.ios?.bundleIdentifier === "com.founders.phillyartours", "Expected com.founders.phillyartours");
  expect("Android package is set", appConfig.android?.package === "com.founders.phillyartours", "Expected com.founders.phillyartours");
  expect("iOS display name is Philly Tours", iosInfoFlat.includes("<key>CFBundleDisplayName</key> <string>Philly Tours</string>"), "Info.plist display name is not aligned");
  expect("Android display name is Philly Tours", androidStrings.includes("<string name=\"app_name\">Philly Tours</string>"), "Android app_name is not aligned");
  expect("iOS uses foreground location copy only", !iosInfo.includes("NSLocationAlways"), "Remove always-location usage descriptions unless background location is implemented");
  expect("iOS does not request local-network permission for production", !iosInfo.includes("NSLocalNetworkUsageDescription"), "Local network prompt should stay out of store builds");
  expect("iOS camera permission copy is present", iosInfo.includes("NSCameraUsageDescription") && iosInfo.includes("AR scenes"), "Camera copy should mention AR scenes");
  expect("Android location and camera permissions are declared", androidManifest.includes("ACCESS_FINE_LOCATION") && androidManifest.includes("CAMERA"), "Expected location and camera permissions");
  expect("Android ARCore is optional", androidManifest.includes("com.google.ar.core") && androidManifest.includes("optional"), "ARCore should be optional for broader installability");
  expect("Android release signing does not use debug signing directly", !releaseBuildBlock.includes("signingConfigs.debug"), "Release buildType still references debug signing");
  expect("Android release signing env hooks exist", androidBuild.includes("PHILLY_TOURS_UPLOAD_STORE_FILE") && androidBuild.includes("signingConfigs.release"), "Release signing env hooks are missing");
}

function checkWebStorePages() {
  const privacyPath = "webapp/privacy.html";
  const supportPath = "webapp/support.html";
  const appJs = readText("webapp/app.js");
  const readiness = readText("docs/store-submission-readiness.md");
  const buildScript = readText("scripts/build-webapp-dist.mjs");

  expect("Privacy page exists", fileExists(privacyPath), "Missing webapp/privacy.html");
  expect("Support page exists", fileExists(supportPath), "Missing webapp/support.html");

  if (fileExists(privacyPath)) {
    const privacy = readText(privacyPath);
    expect("Privacy page has policy content", privacy.includes("<h1>Privacy Policy</h1>") && privacy.includes("Location may be used"), "Privacy page content is incomplete");
  }

  if (fileExists(supportPath)) {
    const support = readText(supportPath);
    expect("Support page has support content", support.includes("<h1>Support</h1>") && support.includes("Contact Support"), "Support page content is incomplete");
  }

  expect("Web Settings links to Privacy and Support", appJs.includes('href="/privacy.html"') && appJs.includes('href="/support.html"'), "Settings tab should expose store support links");
  expect("Store readiness doc has public URLs", readiness.includes("https://philly-tours.com/privacy.html") && readiness.includes("https://philly-tours.com/support.html"), "Store URLs missing from readiness doc");
  expect("Web build stamps every HTML file", buildScript.includes("endsWith(\".html\")") && buildScript.includes("replace(/\\?v="), "Build script should stamp all HTML assets");
}

function checkStoreAssets() {
  const requiredFiles = [
    "assets/icons/philly-app-icon-flat.png",
    "ios/PhillyARTours/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png",
    "assets/icons/philly-app-icon-adaptive-foreground.png",
    "assets/icons/philly-app-adaptive-background.png",
    "webapp/assets/app-store-badge.png",
    "webapp/assets/google-play-store-badge.png"
  ];

  requiredFiles.forEach((relativePath) => {
    expect(`Required asset exists: ${relativePath}`, fileExists(relativePath), "Missing required store/app asset");
  });

  if (!fileExists("assets/store")) {
    warn("Store screenshot export folder is not present yet", "Create assets/store/ when final screenshots and feature graphics are captured.");
  }
}

checkNativeMetadata();
checkWebStorePages();
checkStoreAssets();
checkSecretPatterns();

const failed = checks.filter((check) => !check.ok);

console.log("\nStore release preflight");
console.log("=======================");
checks.forEach((check) => {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}`);
  if (!check.ok && check.detail) {
    console.log(check.detail.split("\n").map((line) => `  ${line}`).join("\n"));
  }
});

if (warnings.length) {
  console.log("\nWarnings");
  console.log("--------");
  warnings.forEach((item) => {
    console.log(`WARN ${item.label}`);
    if (item.detail) {
      console.log(`  ${item.detail}`);
    }
  });
}

if (failed.length) {
  console.log(`\n${failed.length} preflight check(s) failed.`);
  process.exit(1);
}

console.log("\nAll required preflight checks passed.");
