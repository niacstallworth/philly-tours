using System.Text;
using UnityEngine;

namespace PhillyTours.QuestUnity
{
    public class QuestSceneRenderer : MonoBehaviour
    {
        [SerializeField] private QuestSceneRuntimeLoader runtimeLoader;
        [SerializeField] private Vector3 heroObjectPosition = new Vector3(0f, 1.2f, 2.4f);
        [SerializeField] private Vector3 floatingCardPosition = new Vector3(0.55f, 1.45f, 1.9f);
        [SerializeField] private Vector3 routeBeaconPosition = new Vector3(0f, 0.15f, 1.6f);
        [SerializeField] private Vector3 objectScale = new Vector3(0.6f, 0.6f, 0.6f);
        [SerializeField] private Vector2 cardScale = new Vector2(0.65f, 0.4f);

        private GameObject sceneRoot;

        private void Start()
        {
            if (runtimeLoader == null)
            {
                runtimeLoader = GetComponent<QuestSceneRuntimeLoader>() ?? FindObjectOfType<QuestSceneRuntimeLoader>();
            }

            if (runtimeLoader == null)
            {
                Debug.LogWarning("Quest scene renderer could not find a runtime loader.");
                return;
            }

            runtimeLoader.ActiveSceneChanged += HandleActiveSceneChanged;

            if (runtimeLoader.ActiveScene != null)
            {
                RenderScene(runtimeLoader.ActiveScene);
            }
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
            RenderScene(scene);
        }

        private void RenderScene(QuestSceneRecord scene)
        {
            if (scene == null)
            {
                return;
            }

            ClearSceneRoot();

            sceneRoot = new GameObject($"QuestScene_{scene.sceneId}");
            sceneRoot.transform.SetParent(transform, false);

            CreateHeroPlaceholder(scene, sceneRoot.transform);
            CreateFloatingCard(scene, sceneRoot.transform);

            if (scene.ar.type == "route_ghost")
            {
                CreateRouteBeacon(sceneRoot.transform);
            }

            Debug.Log($"Rendered placeholder Quest scene for {scene.stopTitle}.");
        }

        private void ClearSceneRoot()
        {
            if (sceneRoot != null)
            {
                Destroy(sceneRoot);
                sceneRoot = null;
            }
        }

        private void CreateHeroPlaceholder(QuestSceneRecord scene, Transform parent)
        {
            var primitiveType = PrimitiveType.Cube;
            var color = new Color(0.91f, 0.76f, 0.52f, 1f);

            switch (scene.ar.type)
            {
                case "portal_reconstruction":
                    primitiveType = PrimitiveType.Cube;
                    color = new Color(0.92f, 0.78f, 0.57f, 1f);
                    break;
                case "historical_figure_presence":
                    primitiveType = PrimitiveType.Capsule;
                    color = new Color(0.85f, 0.64f, 0.54f, 1f);
                    break;
                case "before_after_overlay":
                    primitiveType = PrimitiveType.Quad;
                    color = new Color(0.63f, 0.85f, 0.79f, 0.85f);
                    break;
                case "object_on_plinth":
                    primitiveType = PrimitiveType.Cylinder;
                    color = new Color(0.88f, 0.82f, 0.71f, 1f);
                    break;
                case "animated_diagram":
                    primitiveType = PrimitiveType.Sphere;
                    color = new Color(0.72f, 0.84f, 0.94f, 1f);
                    break;
            }

            var heroObject = GameObject.CreatePrimitive(primitiveType);
            heroObject.name = "HeroPlaceholder";
            heroObject.transform.SetParent(parent, false);
            heroObject.transform.localPosition = heroObjectPosition;
            heroObject.transform.localScale = ResolveHeroScale(scene, primitiveType);

            var renderer = heroObject.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = color;
            }

            CreateLabel(scene.stopTitle, new Vector3(0f, 0.5f, 0f), heroObject.transform, 0.08f, TextAnchor.MiddleCenter);
        }

        private Vector3 ResolveHeroScale(QuestSceneRecord scene, PrimitiveType primitiveType)
        {
            var resolvedScale = objectScale;
            var authoredScale = scene.placement != null ? scene.placement.scale : 0f;
            if (authoredScale > 0f)
            {
                resolvedScale = Vector3.one * authoredScale;
            }

            if (primitiveType == PrimitiveType.Quad)
            {
                resolvedScale = new Vector3(resolvedScale.x * 1.4f, resolvedScale.y * 1.0f, resolvedScale.z);
            }

            return resolvedScale;
        }

        private void CreateFloatingCard(QuestSceneRecord scene, Transform parent)
        {
            var card = GameObject.CreatePrimitive(PrimitiveType.Quad);
            card.name = "FloatingCard";
            card.transform.SetParent(parent, false);
            card.transform.localPosition = floatingCardPosition;
            card.transform.localScale = new Vector3(cardScale.x, cardScale.y, 1f);

            var renderer = card.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = new Color(0.11f, 0.08f, 0.17f, 0.92f);
            }

            var bodyBuilder = new StringBuilder();
            bodyBuilder.AppendLine(scene.content.headline);
            bodyBuilder.AppendLine();
            bodyBuilder.AppendLine(scene.stopTitle);
            bodyBuilder.AppendLine(scene.content.summary);
            bodyBuilder.AppendLine();
            bodyBuilder.AppendLine($"Prompt: {scene.content.voicePrompts.primary[0]}");

            CreateLabel(bodyBuilder.ToString(), Vector3.zero, card.transform, 0.05f, TextAnchor.MiddleLeft);
        }

        private void CreateRouteBeacon(Transform parent)
        {
            var beacon = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            beacon.name = "RouteBeacon";
            beacon.transform.SetParent(parent, false);
            beacon.transform.localPosition = routeBeaconPosition;
            beacon.transform.localScale = new Vector3(0.08f, 0.15f, 0.08f);

            var renderer = beacon.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = new Color(0.55f, 0.86f, 0.76f, 1f);
            }
        }

        private void CreateLabel(string text, Vector3 localPosition, Transform parent, float characterSize, TextAnchor anchor)
        {
            var label = new GameObject("Label");
            label.transform.SetParent(parent, false);
            label.transform.localPosition = localPosition;

            var textMesh = label.AddComponent<TextMesh>();
            textMesh.text = text;
            textMesh.fontSize = 48;
            textMesh.characterSize = characterSize;
            textMesh.anchor = anchor;
            textMesh.alignment = TextAlignment.Left;
            textMesh.color = new Color(1f, 0.95f, 0.9f, 1f);
        }
    }
}
