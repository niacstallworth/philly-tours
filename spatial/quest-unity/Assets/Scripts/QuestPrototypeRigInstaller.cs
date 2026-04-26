using UnityEngine;

namespace PhillyTours.QuestUnity
{
    public class QuestPrototypeRigInstaller : MonoBehaviour
    {
        [SerializeField] private bool installRuntimeLoader = true;
        [SerializeField] private bool installPassthroughBootstrap = true;
        [SerializeField] private bool installSceneRenderer = true;
        [SerializeField] private bool installHeroBootstrap = true;

        private void Reset()
        {
            EnsureRig();
        }

        private void Awake()
        {
            EnsureRig();
        }

        private void EnsureRig()
        {
            if (installRuntimeLoader && GetComponent<QuestSceneRuntimeLoader>() == null)
            {
                gameObject.AddComponent<QuestSceneRuntimeLoader>();
            }

            if (installPassthroughBootstrap && GetComponent<QuestPassthroughBootstrap>() == null)
            {
                gameObject.AddComponent<QuestPassthroughBootstrap>();
            }

            if (installSceneRenderer && GetComponent<QuestSceneRenderer>() == null)
            {
                gameObject.AddComponent<QuestSceneRenderer>();
            }

            if (installHeroBootstrap && GetComponent<QuestHeroSceneBootstrap>() == null)
            {
                gameObject.AddComponent<QuestHeroSceneBootstrap>();
            }
        }
    }
}
