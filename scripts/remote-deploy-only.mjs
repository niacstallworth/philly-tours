console.error(
  [
    "Local deploys are disabled for this repo.",
    "",
    "Push to main or run the GitHub Actions workflow named \"Deploy Cloudflare Pages\" instead.",
    "For an emergency local upload, use: npm run deploy:local"
  ].join("\n")
);

process.exit(1);
