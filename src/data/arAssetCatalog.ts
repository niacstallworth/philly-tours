export type ARAssetCatalogEntry = {
  tourId: string;
  tourTitle: string;
  stopId: string;
  stopTitle: string;
  arPriority: number;
  arType: string;
  assetStatus: "planned" | "in_production" | "ready" | "approved";
  iosAsset: string;
  androidAsset: string;
  webAsset: string;
  iosAssetExistsLocal: boolean;
  androidAssetExistsLocal: boolean;
  webAssetExistsLocal: boolean;
  scale: number;
  rotationYDeg: number;
  verticalOffsetM?: number;
  anchorStyle: "front_of_user" | "ground" | "image_target" | "location_marker";
  fallbackType: "box" | "card" | "none";
  coordQuality: "verified" | "approximate";
  triggerRadiusM: number;
  assetNeeded: string;
  estimatedEffort: "low" | "medium" | "high" | "";
  notes: string;
  stylePreset: "" | "architectural" | "cinematic" | "editorial" | "museum_card" | "documentary";
  visualPriority: "" | "facade_accuracy" | "historical_accuracy" | "atmosphere" | "readability" | "silhouette";
  historicalEra: string;
  negativePrompt: string;
  sitePlacementMode: "" | "default" | "outdoor_building" | "miniature_reconstruction";
  siteBearingDeg?: number;
  headingToleranceDeg?: number;
  preferredViewingDistanceM?: number;
  siteOffsetXM?: number;
  siteOffsetZM?: number;
  requiresProximity: boolean;
  placementEnvironment: "" | "indoor" | "outdoor" | "mixed";
};

export const arAssetCatalog: ARAssetCatalogEntry[] = [
  {
    "tourId": "black-inventors-tour",
    "tourTitle": "Black Inventors Tour",
    "stopId": "black-inventors-tour-lewis-latimer-light-bulb-exhibit",
    "stopTitle": "Lewis Latimer Light Bulb Exhibit",
    "arPriority": 1,
    "arType": "animated_diagram",
    "assetStatus": "in_production",
    "iosAsset": "/models/lewis-latimer-light-bulb-exhibit.usdz",
    "androidAsset": "/models/lewis-latimer-light-bulb-exhibit.glb",
    "webAsset": "/models/lewis-latimer-light-bulb-exhibit.glb",
    "iosAssetExistsLocal": true,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.9,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "approximate",
    "triggerRadiusM": 40,
    "assetNeeded": "filament model; patent diagram animation; inventor card",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] object-centered AR candidate prioritized over building/site reconstruction",
    "stylePreset": "documentary",
    "visualPriority": "readability",
    "historicalEra": "late 19th century innovation",
    "negativePrompt": "messy composition, extra parts, abstract background noise, unreadable labels",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  },
  {
    "tourId": "black-inventors-tour",
    "tourTitle": "Black Inventors Tour",
    "stopId": "black-inventors-tour-garrett-morgan-traffic-signal",
    "stopTitle": "Garrett Morgan Traffic Signal",
    "arPriority": 2,
    "arType": "animated_diagram",
    "assetStatus": "in_production",
    "iosAsset": "/models/garrett-morgan-traffic-signal.usdz",
    "androidAsset": "/models/garrett-morgan-traffic-signal.glb",
    "webAsset": "/models/garrett-morgan-traffic-signal.glb",
    "iosAssetExistsLocal": false,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.9,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "approximate",
    "triggerRadiusM": 40,
    "assetNeeded": "signal mechanism; intersection explainer; patent timeline",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] object-centered AR candidate prioritized over building/site reconstruction",
    "stylePreset": "documentary",
    "visualPriority": "readability",
    "historicalEra": "early 20th century innovation",
    "negativePrompt": "messy composition, extra parts, abstract background noise, unreadable labels",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  },
  {
    "tourId": "black-inventors-tour",
    "tourTitle": "Black Inventors Tour",
    "stopId": "black-inventors-tour-dr-charles-drew-blood-bank",
    "stopTitle": "Dr. Charles Drew Blood Bank",
    "arPriority": 3,
    "arType": "animated_diagram",
    "assetStatus": "in_production",
    "iosAsset": "/models/dr-charles-drew-blood-bank.usdz",
    "androidAsset": "/models/dr-charles-drew-blood-bank.glb",
    "webAsset": "/models/dr-charles-drew-blood-bank.glb",
    "iosAssetExistsLocal": false,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.88,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "approximate",
    "triggerRadiusM": 40,
    "assetNeeded": "blood plasma storage explainer; medical card set; tubing sequence",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] medical explainer AR candidate prioritized over site reconstruction",
    "stylePreset": "documentary",
    "visualPriority": "readability",
    "historicalEra": "20th century medical innovation",
    "negativePrompt": "messy composition, extra parts, abstract background noise, unreadable labels",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  },
  {
    "tourId": "black-medical-legacy",
    "tourTitle": "Black Medical Legacy",
    "stopId": "black-medical-legacy-mercy-douglass-nurse-training",
    "stopTitle": "Mercy-Douglass Nurse Training",
    "arPriority": 4,
    "arType": "object_on_plinth",
    "assetStatus": "in_production",
    "iosAsset": "/models/mercy-douglass-nurse-training.usdz",
    "androidAsset": "/models/mercy-douglass-nurse-training.glb",
    "webAsset": "/models/mercy-douglass-nurse-training.glb",
    "iosAssetExistsLocal": false,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.72,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "verified",
    "triggerRadiusM": 40,
    "assetNeeded": "nurse cap and diploma miniature; training badge; cohort story card",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] nurse-training artifact scene prioritized over site-scale reconstruction",
    "stylePreset": "documentary",
    "visualPriority": "historical_accuracy",
    "historicalEra": "20th century Black medical education",
    "negativePrompt": "floating fragments, broken anatomy, abstract sculptures, futuristic materials",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  },
  {
    "tourId": "black-medical-legacy",
    "tourTitle": "Black Medical Legacy",
    "stopId": "black-medical-legacy-barbara-bates-center",
    "stopTitle": "Barbara Bates Center",
    "arPriority": 5,
    "arType": "object_on_plinth",
    "assetStatus": "in_production",
    "iosAsset": "/models/barbara-bates-center.usdz",
    "androidAsset": "/models/barbara-bates-center.glb",
    "webAsset": "/models/barbara-bates-center.glb",
    "iosAssetExistsLocal": false,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.72,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "approximate",
    "triggerRadiusM": 40,
    "assetNeeded": "archival nursing kit; oral-history card; collection marker",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] archival object scene prioritized over site-scale reconstruction",
    "stylePreset": "documentary",
    "visualPriority": "historical_accuracy",
    "historicalEra": "20th century nursing archives",
    "negativePrompt": "floating fragments, broken anatomy, abstract sculptures, futuristic materials",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  },
  {
    "tourId": "black-american-sports",
    "tourTitle": "Black American Sports",
    "stopId": "black-american-sports-joe-frazier-s-gym-cloverlay",
    "stopTitle": "Joe Frazier's Gym (Cloverlay)",
    "arPriority": 6,
    "arType": "object_on_plinth",
    "assetStatus": "in_production",
    "iosAsset": "/models/joe-frazier-s-gym-cloverlay.usdz",
    "androidAsset": "/models/joe-frazier-s-gym-cloverlay.glb",
    "webAsset": "/models/joe-frazier-s-gym-cloverlay.glb",
    "iosAssetExistsLocal": false,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.78,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "approximate",
    "triggerRadiusM": 40,
    "assetNeeded": "boxing gloves and belt miniature; gym plaque; training card",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] sports artifact scene prioritized over site reconstruction",
    "stylePreset": "cinematic",
    "visualPriority": "silhouette",
    "historicalEra": "20th century Philadelphia boxing",
    "negativePrompt": "floating fragments, broken anatomy, abstract sculptures, futuristic materials",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  },
  {
    "tourId": "black-american-sports",
    "tourTitle": "Black American Sports",
    "stopId": "black-american-sports-allen-iverson-s-hampton-park-courts",
    "stopTitle": "Allen Iverson's Hampton Park Courts",
    "arPriority": 7,
    "arType": "object_on_plinth",
    "assetStatus": "in_production",
    "iosAsset": "/models/allen-iverson-s-hampton-park-courts.usdz",
    "androidAsset": "/models/allen-iverson-s-hampton-park-courts.glb",
    "webAsset": "/models/allen-iverson-s-hampton-park-courts.glb",
    "iosAssetExistsLocal": false,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.7,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "approximate",
    "triggerRadiusM": 40,
    "assetNeeded": "basketball and crossover trail object; mural card; legacy marker",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] sports object scene prioritized over site reconstruction",
    "stylePreset": "cinematic",
    "visualPriority": "readability",
    "historicalEra": "late 20th to early 21st century Philadelphia basketball",
    "negativePrompt": "floating fragments, broken anatomy, abstract sculptures, futuristic materials",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  },
  {
    "tourId": "black-american-sports",
    "tourTitle": "Black American Sports",
    "stopId": "black-american-sports-sonny-hill-league-tustin",
    "stopTitle": "Sonny Hill League @ Tustin",
    "arPriority": 8,
    "arType": "object_on_plinth",
    "assetStatus": "in_production",
    "iosAsset": "/models/sonny-hill-league-tustin.usdz",
    "androidAsset": "/models/sonny-hill-league-tustin.glb",
    "webAsset": "/models/sonny-hill-league-tustin.glb",
    "iosAssetExistsLocal": false,
    "androidAssetExistsLocal": false,
    "webAssetExistsLocal": false,
    "scale": 0.74,
    "rotationYDeg": 180,
    "verticalOffsetM": 0,
    "anchorStyle": "front_of_user",
    "fallbackType": "card",
    "coordQuality": "approximate",
    "triggerRadiusM": 40,
    "assetNeeded": "summer league trophy; basketball object set; bracket story card",
    "estimatedEffort": "medium",
    "notes": "[strategy-reset] sports object scene prioritized over site reconstruction",
    "stylePreset": "documentary",
    "visualPriority": "readability",
    "historicalEra": "late 20th century Philadelphia basketball",
    "negativePrompt": "floating fragments, broken anatomy, abstract sculptures, futuristic materials",
    "sitePlacementMode": "default",
    "requiresProximity": false,
    "placementEnvironment": "mixed"
  }
];

export const arAssetCatalogByStopId = new Map(arAssetCatalog.map((entry) => [entry.stopId, entry]));
