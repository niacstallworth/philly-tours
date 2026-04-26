# Quest Unity Lane

This folder is reserved for the headset-native Unity client used to prototype Philly Tours mixed reality scenes on Quest 2.

## Target stack

- Unity
- Meta XR All-in-One SDK
- OpenXR
- Quest passthrough
- hand tracking first
- controller fallback

## Repo boundary

Keep this Unity project thin.

The React Native app remains the source of truth for:

- tours
- stops
- narration references
- Story Logistics sequencing
- entitlements and account state

The Unity client should consume generated data from:

- [quest-scenes.json](/Users/nia/Documents/GitHub/philly-tours/spatial/runtime/philly/quest-scenes.json)
- [quest-hero-scenes.json](/Users/nia/Documents/GitHub/philly-tours/spatial/runtime/philly/quest-hero-scenes.json)

Generate the latest payload with:

```bash
CITY=philly npm run spatial:quest:build
```

## Suggested project layout

```text
spatial/quest-unity/
  Assets/
    Scripts/
      QuestPrototypeRigInstaller.cs
      QuestPassthroughBootstrap.cs
      QuestSceneRenderer.cs
      QuestSceneData.cs
      QuestSceneRuntimeLoader.cs
      QuestHeroSceneBootstrap.cs
    StreamingAssets/
      quest-hero-scenes.json
      quest-scenes.json
    Prefabs/
    Scenes/
```

## First implementation slice

1. Enable passthrough on Quest 2.
2. Copy `quest-hero-scenes.json` into `StreamingAssets`.
3. Start with `Mother Bethel AME Church`.
4. Add one empty GameObject named `QuestPrototypeRig`.
5. Attach `QuestPrototypeRigInstaller`.
6. Let it auto-install the runtime loader, passthrough hook, renderer, and hero bootstrap.
7. Press Play to render one placeholder hero object plus one compact floating card.
8. Replace the placeholder renderer with real model loading and Meta passthrough components.

## Orion rule

Even while testing on Quest 2, keep the UI compatible with a future Orion-style true AR experience:

- one primary object at a time
- compact floating cards only
- no giant VR menus
- no controller-only flows
- voice-first commands
