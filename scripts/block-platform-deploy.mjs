console.error("");
console.error("Platform deploy is intentionally blocked.");
console.error("Use a city-specific repo for production deployments instead:");
console.error("- /Users/nia/Documents/GitHub/philly-tours-philly");
console.error("- /Users/nia/Documents/GitHub/philly-tours-baltimore");
console.error("");
console.error("If you really need a platform-city preview deploy, run `npm run deploy:city` with an explicit CITY.");
process.exit(1);
