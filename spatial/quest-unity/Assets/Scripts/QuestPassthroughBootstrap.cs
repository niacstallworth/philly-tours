using UnityEngine;

namespace PhillyTours.QuestUnity
{
    public class QuestPassthroughBootstrap : MonoBehaviour
    {
        [SerializeField] private Camera targetCamera;
        [SerializeField] private Color fallbackBackgroundColor = Color.black;
        [SerializeField] private bool logPassthroughReminder = true;

        private void Awake()
        {
            if (targetCamera == null)
            {
                targetCamera = Camera.main;
            }

            if (targetCamera == null)
            {
                Debug.LogWarning("Quest passthrough bootstrap could not find a camera yet.");
                return;
            }

            targetCamera.clearFlags = CameraClearFlags.SolidColor;
            targetCamera.backgroundColor = fallbackBackgroundColor;

            if (logPassthroughReminder)
            {
                Debug.Log(
                    "Quest passthrough fallback is active. In Unity, enable Quest passthrough with the Meta XR All-in-One SDK and keep this script as the scene bootstrap seam."
                );
            }
        }
    }
}
