using UnityEngine;

namespace PhillyTours.QuestUnity
{
    public class QuestHeroSceneBootstrap : MonoBehaviour
    {
        [SerializeField] private QuestSceneRuntimeLoader runtimeLoader;

        private void Start()
        {
            if (runtimeLoader == null)
            {
                runtimeLoader = FindObjectOfType<QuestSceneRuntimeLoader>();
            }

            if (runtimeLoader == null || runtimeLoader.ActiveScene == null)
            {
                if (runtimeLoader != null)
                {
                    runtimeLoader.ActiveSceneChanged += HandleActiveSceneChanged;
                }
                else
                {
                    Debug.LogWarning("Quest hero bootstrap is waiting for a runtime loader.");
                }
                return;
            }

            BootstrapScene(runtimeLoader.ActiveScene);
        }

        private void OnDestroy()
        {
            if (runtimeLoader != null)
            {
                runtimeLoader.ActiveSceneChanged -= HandleActiveSceneChanged;
            }
        }

        private void HandleActiveSceneChanged(QuestSceneRecord scene)
        {
            BootstrapScene(scene);
        }

        private void BootstrapScene(QuestSceneRecord scene)
        {
            if (scene == null)
            {
                Debug.LogWarning("Quest hero bootstrap did not receive a scene.");
                return;
            }

            Debug.Log(
                $"Bootstrap hero stop: {scene.stopTitle} | headline={scene.content.headline} | prompt={scene.content.voicePrompts.primary[0]}"
            );

            // Replace these logs with passthrough setup, model loading, and panel rendering.
            Debug.Log($"Use model asset: {scene.assets.models.android}");
            Debug.Log($"Use anchor style: {scene.placement.anchorStyle}");
            Debug.Log($"Use UI surface profile: {scene.ui.surfaceProfile}");
        }
    }
}
