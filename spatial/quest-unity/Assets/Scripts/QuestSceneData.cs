using System;

namespace PhillyTours.QuestUnity
{
    [Serializable]
    public class QuestSceneRuntime
    {
        public string generatedAt;
        public string cityId;
        public string runtimeProfile;
        public QuestRuntimeDefaults defaults;
        public QuestTourSummary[] tours;
        public QuestSceneRecord[] scenes;
    }

    [Serializable]
    public class QuestRuntimeDefaults
    {
        public string launchSceneId;
        public string launchTourId;
        public string[] availableSceneIds;
    }

    [Serializable]
    public class QuestTourSummary
    {
        public string id;
        public string title;
        public int durationMin;
        public float distanceMiles;
        public int arSceneCount;
        public int heroSceneCount;
        public string firstSceneId;
        public string firstHeroSceneId;
    }

    [Serializable]
    public class QuestSceneRecord
    {
        public string sceneId;
        public string stopId;
        public string stopTitle;
        public string tourId;
        public string tourTitle;
        public int sortOrder;
        public QuestSceneAr ar;
        public QuestSceneContent content;
        public QuestSceneAssets assets;
        public QuestScenePlacement placement;
        public QuestSceneUi ui;
    }

    [Serializable]
    public class QuestSceneAr
    {
        public string type;
        public int priority;
        public string estimatedEffort;
        public bool heroMoment;
    }

    [Serializable]
    public class QuestSceneContent
    {
        public string headline;
        public string summary;
        public string description;
        public string[] contentLayers;
        public QuestSceneVoicePrompts voicePrompts;
        public string[] interactionHints;
    }

    [Serializable]
    public class QuestSceneVoicePrompts
    {
        public string[] primary;
        public string[] fallback;
    }

    [Serializable]
    public class QuestSceneAssets
    {
        public QuestSceneModels models;
        public QuestSceneAudio audio;
    }

    [Serializable]
    public class QuestSceneModels
    {
        public string @default;
        public string ios;
        public string android;
        public string web;
    }

    [Serializable]
    public class QuestSceneAudio
    {
        public string @default;
        public string drive;
        public string walk;
    }

    [Serializable]
    public class QuestScenePlacement
    {
        public string anchorStyle;
        public string placementNote;
        public float scale;
        public float rotationYDeg;
        public float verticalOffsetM;
        public float preferredViewingDistanceM;
        public string sitePlacementMode;
    }

    [Serializable]
    public class QuestSceneUi
    {
        public string surfaceProfile;
        public string overlayBudget;
        public bool supportsPanelReposition;
        public bool supportsVoiceCommands;
        public bool supportsHandTracking;
        public bool controllerFallback;
    }
}
