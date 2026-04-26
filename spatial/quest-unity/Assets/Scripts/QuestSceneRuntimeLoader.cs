using System;
using System.Collections;
using System.IO;
using System.Linq;
using UnityEngine;
using UnityEngine.Networking;

namespace PhillyTours.QuestUnity
{
    public class QuestSceneRuntimeLoader : MonoBehaviour
    {
        [SerializeField] private string payloadFileName = "quest-hero-scenes.json";
        [SerializeField] private string preferredSceneId = "";
        [SerializeField] private bool logAvailableScenes = true;

        public QuestSceneRuntime Runtime { get; private set; }
        public QuestSceneRecord ActiveScene { get; private set; }
        public bool IsLoaded { get; private set; }
        public event Action<QuestSceneRecord> RuntimeLoaded;
        public event Action<QuestSceneRecord> ActiveSceneChanged;

        private void Awake()
        {
            StartCoroutine(LoadRuntimeCoroutine());
        }

        private IEnumerator LoadRuntimeCoroutine()
        {
            var payloadPath = Path.Combine(Application.streamingAssetsPath, payloadFileName);
            string json = null;

            if (payloadPath.Contains("://") || payloadPath.Contains(":///"))
            {
                using (var request = UnityWebRequest.Get(payloadPath))
                {
                    yield return request.SendWebRequest();

                    if (request.result != UnityWebRequest.Result.Success)
                    {
                        Debug.LogError($"Quest runtime payload failed to load at {payloadPath}: {request.error}");
                        yield break;
                    }

                    json = request.downloadHandler.text;
                }
            }
            else
            {
                if (!File.Exists(payloadPath))
                {
                    Debug.LogError($"Quest runtime payload not found at {payloadPath}");
                    yield break;
                }

                json = File.ReadAllText(payloadPath);
            }

            Runtime = JsonUtility.FromJson<QuestSceneRuntime>(json);

            if (Runtime == null || Runtime.scenes == null || Runtime.scenes.Length == 0)
            {
                Debug.LogError("Quest runtime payload loaded, but no scenes were available.");
                yield break;
            }

            Debug.Log(
                $"Loaded Quest runtime for {Runtime.cityId} ({Runtime.runtimeProfile}) with {Runtime.scenes.Length} scenes."
            );

            if (logAvailableScenes)
            {
                foreach (var scene in Runtime.scenes)
                {
                    Debug.Log($"Scene available: {scene.sceneId} [{scene.ar.type}]");
                }
            }

            SelectInitialScene();
            IsLoaded = ActiveScene != null;
            RuntimeLoaded?.Invoke(ActiveScene);
            ActiveSceneChanged?.Invoke(ActiveScene);
        }

        private void SelectInitialScene()
        {
            if (Runtime?.scenes == null || Runtime.scenes.Length == 0)
            {
                return;
            }

            ActiveScene = FindScene(preferredSceneId)
                ?? FindScene(Runtime.defaults != null ? Runtime.defaults.launchSceneId : "")
                ?? Runtime.scenes.FirstOrDefault();

            if (ActiveScene == null)
            {
                Debug.LogError("Unable to select an initial Quest scene.");
                return;
            }

            Debug.Log(
                $"Selected initial Quest scene: {ActiveScene.stopTitle} ({ActiveScene.sceneId}) using {ActiveScene.ui.surfaceProfile}."
            );
        }

        public QuestSceneRecord FindScene(string sceneId)
        {
            if (string.IsNullOrWhiteSpace(sceneId) || Runtime?.scenes == null)
            {
                return null;
            }

            return Runtime.scenes.FirstOrDefault(scene =>
                string.Equals(scene.sceneId, sceneId, StringComparison.OrdinalIgnoreCase));
        }

        public void ActivateScene(string sceneId)
        {
            var nextScene = FindScene(sceneId);
            if (nextScene == null)
            {
                Debug.LogWarning($"Quest scene not found: {sceneId}");
                return;
            }

            ActiveScene = nextScene;
            Debug.Log(
                $"Activated Quest scene: {ActiveScene.stopTitle} | model={ActiveScene.assets.models.android} | anchor={ActiveScene.placement.anchorStyle}"
            );
            ActiveSceneChanged?.Invoke(ActiveScene);
        }
    }
}
