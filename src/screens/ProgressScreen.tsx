import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, Chip } from "../components/ui/Primitives";
import { tours } from "../data/tours";
import { getCurrentTourSelection } from "../services/tourControl";
import { getGameProgressSnapshot, subscribeToGameProgress } from "../services/gameProgress";
import { AppPalette, useThemeColors, useTypeScale } from "../theme/appTheme";

type Badge = {
  title: string;
  detail: string;
  earned: boolean;
};

type RewardTier = {
  title: string;
  detail: string;
  unlocked: boolean;
};

const LEVELS = [
  { title: "Visitor", minXp: 0 },
  { title: "Route Scout", minXp: 100 },
  { title: "Story Keeper", minXp: 250 },
  { title: "City Archivist", minXp: 500 },
  { title: "Founder Guide", minXp: 900 }
];

export function ProgressScreen() {
  const colors = useThemeColors();
  const type = useTypeScale();
  const styles = React.useMemo(() => createStyles(colors, type), [colors, type]);
  const [progress, setProgress] = React.useState(() => getGameProgressSnapshot());
  const activeSelection = getCurrentTourSelection();
  const progressSets = React.useMemo(
    () => ({
      opened: new Set(progress.openedStopIds),
      completed: new Set(progress.completedStopIds),
      narrated: new Set(progress.narratedStopIds),
      arDiscovered: new Set(progress.discoveredArStopIds)
    }),
    [progress]
  );
  const activeTour =
    tours.find((tour) => tour.id === activeSelection.tourId) ||
    tours.find((tour) => tour.stops.some((stop) => progressSets.opened.has(stop.id) || progressSets.completed.has(stop.id))) ||
    tours[0];
  const completedStops = activeTour.stops.filter((stop) => progressSets.completed.has(stop.id)).length;
  const openedStops = activeTour.stops.filter((stop) => progressSets.opened.has(stop.id)).length;
  const heardNarrations = progressSets.narrated.size;
  const arAvailable = tours.flatMap((tour) => tour.stops.filter((stop) => stop.arType && stop.arType !== "none")).length;
  const arDiscoveries = progressSets.arDiscovered.size;
  const totalStops = activeTour.stops.length;
  const routePct = totalStops ? Math.round((completedStops / totalStops) * 100) : 0;
  const activeNarrations = activeTour.stops.filter((stop) => progressSets.narrated.has(stop.id)).length;
  const activeArStops = activeTour.stops.filter((stop) => stop.arType && stop.arType !== "none");
  const activeArDiscoveries = activeArStops.filter((stop) => progressSets.arDiscovered.has(stop.id)).length;
  const storyPct = totalStops ? Math.round((activeNarrations / totalStops) * 100) : 0;
  const arPct = activeArStops.length ? Math.round((activeArDiscoveries / activeArStops.length) * 100) : 0;
  const xp = progress.totalXp;
  const currentLevelIndex = LEVELS.reduce((activeIndex, level, index) => (xp >= level.minXp ? index : activeIndex), 0);
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1] || null;
  const previousLevelXp = currentLevel.minXp;
  const nextLevelXp = nextLevel?.minXp || currentLevel.minXp;
  const levelSpan = Math.max(nextLevelXp - previousLevelXp, 1);
  const levelPct = nextLevel ? Math.min(100, Math.round(((xp - previousLevelXp) / levelSpan) * 100)) : 100;
  const nextStop = activeTour.stops.find((stop) => !progressSets.completed.has(stop.id)) || activeTour.stops[0];
  const badges: Badge[] = [
    { title: "First Stop", detail: "Complete one stop", earned: completedStops >= 1 },
    { title: "Story Listener", detail: "Hear two narrations", earned: heardNarrations >= 2 },
    { title: "AR Explorer", detail: "Find an AR-ready stop", earned: arDiscoveries > 0 },
    { title: "Full Route", detail: "Complete every stop in one tour", earned: totalStops > 0 && completedStops >= totalStops },
    { title: "Streak Starter", detail: "Tour on two active days", earned: progress.currentStreakDays >= 2 },
    { title: "Score 250", detail: "Reach 250 total XP", earned: xp >= 250 }
  ];
  const earnedBadgeCount = badges.filter((badge) => badge.earned).length;
  const todayKey = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);
  const dailyQuestCount = Math.min(progress.dailyQuestDate === todayKey ? progress.dailyNarrationCount : 0, 3);
  const weeklyQuestCount = Math.min(completedStops, 5);
  const groupGoal = Math.max(totalStops, 1);
  const groupActions = Math.min(groupGoal, completedStops + Math.floor(activeNarrations / 2) + Math.min(activeArDiscoveries, 2));
  const groupPct = Math.round((groupActions / groupGoal) * 100);
  const collectionStops = activeTour.stops.slice(0, 6).map((stop) => ({
    stop,
    collected: progressSets.opened.has(stop.id) || progressSets.narrated.has(stop.id) || progressSets.completed.has(stop.id),
    complete: progressSets.completed.has(stop.id)
  }));
  const rewardTiers: RewardTier[] = [
    { title: "Route Starter", detail: "Unlocked at 100 XP", unlocked: xp >= 100 },
    { title: "Story Lens", detail: "Unlocked after 2 heard stories", unlocked: heardNarrations >= 2 },
    { title: "AR Token", detail: "Unlocked after 1 AR discovery", unlocked: arDiscoveries >= 1 },
    { title: "Founder Pass", detail: "Unlocked at 900 XP", unlocked: xp >= 900 }
  ];
  const tourProgress = tours.slice(0, 6).map((tour) => {
    const completed = tour.stops.filter((stop) => progressSets.completed.has(stop.id)).length;
    return {
      tour,
      completed,
      pct: tour.stops.length ? Math.round((completed / tour.stops.length) * 100) : 0
    };
  });

  React.useEffect(() => subscribeToGameProgress(setProgress), []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroPanel}>
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />
        <Text style={styles.heroEyebrow}>Board</Text>
        <Text style={styles.heroTitle}>{currentLevel.title}</Text>
        <Text style={styles.heroCopy}>Collect stories, unlock badges, hold a streak, and level up across Philadelphia.</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{xp}</Text>
            <Text style={styles.heroStatLabel}>score</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{progress.currentStreakDays}</Text>
            <Text style={styles.heroStatLabel}>day streak</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{earnedBadgeCount}</Text>
            <Text style={styles.heroStatLabel}>badges</Text>
          </View>
        </View>
        <View style={styles.heroLevelTrack}>
          <View style={[styles.heroLevelFill, { width: `${levelPct}%` }]} />
        </View>
        <Text style={styles.heroLevelCopy}>
          {nextLevel ? `${Math.max(nextLevelXp - xp, 0)} XP to ${nextLevel.title}` : "Top rank reached"}
        </Text>
      </View>

      <Card style={styles.scoreCard}>
        <Text style={styles.sectionEyebrow}>Scoring</Text>
        <Text style={styles.sectionTitle}>Earn points by touring</Text>
        <View style={styles.scoreRulesGrid}>
          <View style={styles.scoreRule}>
            <Text style={styles.scoreRuleValue}>+10</Text>
            <Text style={styles.scoreRuleLabel}>open stop</Text>
          </View>
          <View style={styles.scoreRule}>
            <Text style={styles.scoreRuleValue}>+25</Text>
            <Text style={styles.scoreRuleLabel}>hear story</Text>
          </View>
          <View style={styles.scoreRule}>
            <Text style={styles.scoreRuleValue}>+40</Text>
            <Text style={styles.scoreRuleLabel}>complete stop</Text>
          </View>
          <View style={styles.scoreRule}>
            <Text style={styles.scoreRuleValue}>+60</Text>
            <Text style={styles.scoreRuleLabel}>find AR</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.sectionEyebrow}>Streak</Text>
            <Text style={styles.sectionTitle}>{progress.currentStreakDays} active day{progress.currentStreakDays === 1 ? "" : "s"}</Text>
          </View>
          <View style={styles.progressChipWrap}>
            <Chip label={`Best ${progress.longestStreakDays}`} tone="warn" />
          </View>
        </View>
        <Text style={styles.copy}>Open a stop, hear narration, or complete a stop on a new day to keep the streak alive.</Text>
        <View style={styles.streakDots}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <View key={day} style={day < Math.min(progress.currentStreakDays, 7) ? styles.streakDotActive : styles.streakDot} />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.sectionEyebrow}>Active quest</Text>
            <Text style={styles.sectionTitle}>{activeTour.title}</Text>
          </View>
          <View style={styles.progressChipWrap}>
            <Chip label={`${routePct}%`} tone="success" />
          </View>
        </View>
        <Text style={styles.copy}>Next stop: {nextStop?.title || "Choose a tour stop"}</Text>
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{completedStops}</Text>
            <Text style={styles.metricLabel}>stops done</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{openedStops}</Text>
            <Text style={styles.metricLabel}>stops opened</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{heardNarrations}</Text>
            <Text style={styles.metricLabel}>stories heard</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{tours.length}</Text>
            <Text style={styles.metricLabel}>tour packs</Text>
          </View>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${routePct}%` }]} />
        </View>
        <View style={styles.chips}>
          <Chip label={`${routePct}% complete`} tone="success" />
          <Chip label="+40 XP per stop" tone="default" />
          <Chip label="+25 XP per narration" tone="warn" />
        </View>
      </Card>

      <Card style={styles.questCard}>
        <Text style={styles.sectionEyebrow}>Today</Text>
        <Text style={styles.sectionTitle}>Hear one new story</Text>
        <Text style={styles.copy}>Play narration at any unlocked stop to finish today's quest and add 25 XP to the board.</Text>
        <View style={styles.questSteps}>
          {[0, 1, 2].map((step) => (
            <View key={step} style={step < dailyQuestCount ? styles.questStepDone : styles.questStep} />
          ))}
        </View>
        <View style={styles.chips}>
          <Chip label={`${dailyQuestCount} of 3 actions`} tone="warn" />
          <Chip label="Reward: 25 XP" tone="success" />
        </View>
        <View style={styles.weeklyQuest}>
          <Text style={styles.weeklyQuestTitle}>Weekly route quest</Text>
          <Text style={styles.copy}>Complete 5 stops this week to unlock the route finisher reward.</Text>
          <View style={styles.questSteps}>
            {[0, 1, 2, 3, 4].map((step) => (
              <View key={step} style={step < weeklyQuestCount ? styles.questStepDone : styles.questStep} />
            ))}
          </View>
          <Chip label={`${weeklyQuestCount} of 5 stops`} tone="success" />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Tour progress rings</Text>
        <Text style={styles.sectionTitle}>Route, stories, and AR</Text>
        <View style={styles.ringGrid}>
          <View style={styles.ringCard}>
            <View style={[styles.ringOuter, routePct >= 100 && styles.ringOuterComplete]}>
              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{routePct}%</Text>
              </View>
            </View>
            <Text style={styles.ringLabel}>Route</Text>
          </View>
          <View style={styles.ringCard}>
            <View style={[styles.ringOuter, storyPct >= 100 && styles.ringOuterComplete]}>
              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{storyPct}%</Text>
              </View>
            </View>
            <Text style={styles.ringLabel}>Stories</Text>
          </View>
          <View style={styles.ringCard}>
            <View style={[styles.ringOuter, arPct >= 100 && styles.ringOuterComplete]}>
              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{arPct}%</Text>
              </View>
            </View>
            <Text style={styles.ringLabel}>AR</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Collection book</Text>
        <Text style={styles.sectionTitle}>Stop cards</Text>
        <View style={styles.collectionBookGrid}>
          {collectionStops.map(({ stop, collected, complete }) => (
            <View key={stop.id} style={[styles.collectionBookCard, collected && styles.collectionBookCardCollected]}>
              <Text style={styles.collectionBookTitle}>{collected ? stop.title : "Locked stop"}</Text>
              <Text style={styles.collectionBookMeta}>{complete ? "Completed" : collected ? "Collected" : "Open the stop to reveal"}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Private group progress</Text>
        <Text style={styles.sectionTitle}>Shared route goal</Text>
        <Text style={styles.copy}>A personal group-style meter for comparing your latest tour actions against the active route goal.</Text>
        <View style={styles.groupBarTrack}>
          <View style={[styles.groupBarFill, { width: `${groupPct}%` }]} />
        </View>
        <View style={styles.chips}>
          <Chip label={`${groupActions} of ${groupGoal} actions`} tone="success" />
          <Chip label={`Best streak ${progress.longestStreakDays}`} tone="warn" />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Route timeline</Text>
        <Text style={styles.sectionTitle}>Stop-by-stop path</Text>
        <View style={styles.timeline}>
          {activeTour.stops.slice(0, 8).map((stop, index) => {
            const done = progressSets.completed.has(stop.id);
            const open = progressSets.opened.has(stop.id) || progressSets.narrated.has(stop.id);
            return (
              <View key={stop.id} style={styles.timelineRow}>
                <View style={[styles.timelineDot, done && styles.timelineDotDone, !done && open && styles.timelineDotOpen]}>
                  <Text style={styles.timelineDotText}>{index + 1}</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>{stop.title}</Text>
                  <Text style={styles.timelineMeta}>{done ? "Completed" : open ? "In progress" : "Locked"}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Rewards</Text>
        <Text style={styles.sectionTitle}>Unlocks</Text>
        {rewardTiers.map((reward) => (
          <View key={reward.title} style={[styles.rewardRow, reward.unlocked && styles.rewardRowUnlocked]}>
            <View style={styles.rewardText}>
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <Text style={styles.rewardMeta}>{reward.detail}</Text>
            </View>
            <Chip label={reward.unlocked ? "Unlocked" : "Locked"} tone={reward.unlocked ? "success" : "default"} />
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Levels</Text>
        <Text style={styles.sectionTitle}>Rank ladder</Text>
        {LEVELS.map((level) => {
          const active = level.title === currentLevel.title;
          const reached = xp >= level.minXp;
          return (
            <View key={level.title} style={[styles.levelRow, active && styles.levelRowActive]}>
              <Text style={[styles.levelName, reached && styles.levelNameReached]}>{level.title}</Text>
              <Text style={styles.levelMeta}>{level.minXp} XP</Text>
            </View>
          );
        })}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Badge shelf</Text>
        <Text style={styles.sectionTitle}>Earned and upcoming</Text>
        <View style={styles.badgeGrid}>
          {badges.map((badge) => (
            <View key={badge.title} style={[styles.badgeCard, badge.earned && styles.badgeCardEarned]}>
              <Text style={[styles.badgeTitle, badge.earned && styles.badgeTitleEarned]}>{badge.title}</Text>
              <Text style={styles.badgeDetail}>{badge.detail}</Text>
              <Text style={[styles.badgeState, badge.earned && styles.badgeStateEarned]}>
                {badge.earned ? "Unlocked" : "Locked"}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Recent score</Text>
        <Text style={styles.sectionTitle}>Latest XP awards</Text>
        {progress.scoreEvents.length ? (
          progress.scoreEvents.slice().reverse().slice(0, 4).map((event) => (
            <View key={event.id} style={styles.scoreEventRow}>
              <Text style={styles.scoreEventLabel}>{event.label}</Text>
              <Text style={styles.scoreEventXp}>+{event.xp}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.copy}>Open a stop or play narration to start scoring.</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>AR discoveries</Text>
        <Text style={styles.sectionTitle}>Scene collection</Text>
        <Text style={styles.copy}>AR-ready stops become collection targets. Open the matching tour page, choose the stop, then launch AR when available.</Text>
        <View style={styles.collectionGrid}>
          <View style={styles.collectionCard}>
            <Text style={styles.collectionValue}>{arAvailable}</Text>
            <Text style={styles.collectionLabel}>available AR stops</Text>
          </View>
          <View style={styles.collectionCard}>
            <Text style={styles.collectionValue}>{arDiscoveries}</Text>
            <Text style={styles.collectionLabel}>discovered</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionEyebrow}>Tour collection</Text>
        <Text style={styles.sectionTitle}>Route completion</Text>
        {tourProgress.map(({ tour, completed, pct }) => (
          <View key={tour.id} style={styles.tourRow}>
            <View style={styles.tourRowHeader}>
              <Text style={styles.tourTitle}>{tour.title}</Text>
              <Text style={styles.tourPct}>{pct}%</Text>
            </View>
            <Text style={styles.tourMeta}>{completed} of {tour.stops.length} stops completed</Text>
            <View style={styles.smallTrack}>
              <View style={[styles.smallFill, { width: `${pct}%` }]} />
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function createStyles(
  colors: AppPalette,
  type: {
    font: (size: number) => number;
    line: (height: number) => number;
  }
) {
  return StyleSheet.create({
    container: { padding: 18, paddingBottom: 118, gap: 16, backgroundColor: colors.background },
    heroPanel: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#07070d",
      borderRadius: 30,
      padding: 22,
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)"
    },
    heroGlowPrimary: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: "rgba(91, 56, 245, 0.24)",
      top: -96,
      right: -70
    },
    heroGlowSecondary: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor: "rgba(255, 188, 138, 0.12)",
      bottom: -90,
      left: -60
    },
    heroEyebrow: { color: "rgba(255,255,255,0.72)", fontSize: type.font(12), fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.2 },
    heroTitle: { color: "#ffffff", fontSize: type.font(34), lineHeight: type.line(39), fontWeight: "800" },
    heroCopy: { color: "rgba(255,255,255,0.82)", lineHeight: type.line(21), fontSize: type.font(14) },
    heroStats: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    heroStat: {
      minWidth: "30%",
      flexGrow: 1,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)"
    },
    heroStatValue: { color: "#ffffff", fontSize: type.font(24), fontWeight: "800" },
    heroStatLabel: { marginTop: 2, color: "rgba(255,255,255,0.68)", fontSize: type.font(11), fontWeight: "800", textTransform: "uppercase" },
    heroLevelTrack: { height: 14, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.12)" },
    heroLevelFill: { height: 14, borderRadius: 999, backgroundColor: "#ffbc8a" },
    heroLevelCopy: { color: "rgba(255,255,255,0.7)", fontSize: type.font(12), fontWeight: "700" },
    card: { gap: 14, backgroundColor: colors.surfaceRaised },
    scoreCard: { gap: 14, backgroundColor: colors.surfaceRaised, borderColor: colors.infoSoft },
    questCard: { gap: 14, backgroundColor: colors.surfaceRaised, borderColor: colors.warnSoft },
    cardHeader: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
    cardHeaderText: { flex: 1, minWidth: 0 },
    progressChipWrap: { flexShrink: 0, alignSelf: "flex-start" },
    sectionEyebrow: { color: colors.warn, fontSize: type.font(11), fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
    sectionTitle: { color: colors.text, fontSize: type.font(20), lineHeight: type.line(24), fontWeight: "800" },
    copy: { color: colors.textSoft, fontSize: type.font(14), lineHeight: type.line(20) },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    metricGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10
    },
    metricCard: {
      minWidth: "47%",
      flexGrow: 1,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface
    },
    metricValue: {
      color: colors.text,
      fontSize: type.font(26),
      fontWeight: "800"
    },
    metricLabel: {
      marginTop: 4,
      color: colors.textMuted,
      fontSize: type.font(12),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8
    },
    barTrack: { height: 16, backgroundColor: colors.surfaceSoft, borderRadius: 999, overflow: "hidden" },
    barFill: { height: 16, backgroundColor: "#4f2df5", borderRadius: 999 },
    scoreRulesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    scoreRule: {
      minWidth: "47%",
      flexGrow: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      backgroundColor: colors.surface
    },
    scoreRuleValue: { color: colors.info, fontSize: type.font(24), fontWeight: "800" },
    scoreRuleLabel: { marginTop: 4, color: colors.textMuted, fontSize: type.font(11), fontWeight: "800", textTransform: "uppercase" },
    streakDots: { flexDirection: "row", gap: 8 },
    streakDot: { flex: 1, height: 12, borderRadius: 999, backgroundColor: colors.surfaceSoft },
    streakDotActive: { flex: 1, height: 12, borderRadius: 999, backgroundColor: colors.warn },
    questSteps: { flexDirection: "row", gap: 8 },
    questStep: { flex: 1, height: 10, borderRadius: 999, backgroundColor: colors.surfaceSoft },
    questStepDone: { flex: 1, height: 10, borderRadius: 999, backgroundColor: colors.warn },
    weeklyQuest: {
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 14
    },
    weeklyQuestTitle: { color: colors.text, fontSize: type.font(15), fontWeight: "800" },
    ringGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    ringCard: {
      minWidth: "30%",
      flexGrow: 1,
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.surface,
      paddingVertical: 14,
      paddingHorizontal: 10
    },
    ringOuter: {
      width: 72,
      height: 72,
      borderRadius: 999,
      borderWidth: 8,
      borderColor: colors.info,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.infoSoft
    },
    ringOuterComplete: { borderColor: colors.success, backgroundColor: colors.successSoft },
    ringInner: {
      width: 48,
      height: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceRaised
    },
    ringValue: { color: colors.text, fontSize: type.font(14), fontWeight: "800" },
    ringLabel: { color: colors.textMuted, fontSize: type.font(11), fontWeight: "800", textTransform: "uppercase" },
    collectionBookGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    collectionBookCard: {
      minWidth: "47%",
      flexGrow: 1,
      minHeight: 90,
      justifyContent: "space-between",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 10
    },
    collectionBookCardCollected: { borderColor: colors.warn, backgroundColor: colors.warnSoft },
    collectionBookTitle: { color: colors.text, fontSize: type.font(14), lineHeight: type.line(18), fontWeight: "800" },
    collectionBookMeta: { color: colors.textMuted, fontSize: type.font(11), fontWeight: "800", textTransform: "uppercase" },
    groupBarTrack: { height: 16, borderRadius: 999, overflow: "hidden", backgroundColor: colors.surfaceSoft },
    groupBarFill: { height: 16, borderRadius: 999, backgroundColor: colors.success },
    timeline: { gap: 12 },
    timelineRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    timelineDot: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border
    },
    timelineDotOpen: { backgroundColor: colors.warnSoft, borderColor: colors.warn },
    timelineDotDone: { backgroundColor: colors.successSoft, borderColor: colors.success },
    timelineDotText: { color: colors.text, fontSize: type.font(12), fontWeight: "800" },
    timelineContent: { flex: 1, minWidth: 0 },
    timelineTitle: { color: colors.text, fontSize: type.font(14), lineHeight: type.line(18), fontWeight: "800" },
    timelineMeta: { marginTop: 2, color: colors.textMuted, fontSize: type.font(12), fontWeight: "700" },
    rewardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.surface,
      padding: 14
    },
    rewardRowUnlocked: { borderColor: colors.success, backgroundColor: colors.successSoft },
    rewardText: { flex: 1, minWidth: 0, gap: 3 },
    rewardTitle: { color: colors.text, fontSize: type.font(14), fontWeight: "800" },
    rewardMeta: { color: colors.textSoft, fontSize: type.font(12), lineHeight: type.line(16) },
    badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    badgeCard: {
      minWidth: "47%",
      flexGrow: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 6,
      backgroundColor: colors.surface
    },
    badgeCardEarned: { borderColor: colors.success, backgroundColor: colors.successSoft },
    badgeTitle: { color: colors.text, fontSize: type.font(15), fontWeight: "800" },
    badgeTitleEarned: { color: colors.success },
    badgeDetail: { color: colors.textSoft, fontSize: type.font(12), lineHeight: type.line(17) },
    badgeState: { color: colors.textMuted, fontSize: type.font(11), fontWeight: "800", textTransform: "uppercase" },
    badgeStateEarned: { color: colors.success },
    collectionGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    collectionCard: {
      minWidth: "47%",
      flexGrow: 1,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface
    },
    collectionValue: { color: colors.text, fontSize: type.font(28), fontWeight: "800" },
    collectionLabel: { marginTop: 4, color: colors.textMuted, fontSize: type.font(11), fontWeight: "800", textTransform: "uppercase" },
    levelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.surface
    },
    levelRowActive: { borderColor: colors.info, backgroundColor: colors.infoSoft },
    levelName: { color: colors.textSoft, fontSize: type.font(14), fontWeight: "800" },
    levelNameReached: { color: colors.text },
    levelMeta: { color: colors.textMuted, fontSize: type.font(12), fontWeight: "800" },
    scoreEventRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 8
    },
    scoreEventLabel: { flex: 1, color: colors.text, fontSize: type.font(14), fontWeight: "700" },
    scoreEventXp: { color: colors.success, fontSize: type.font(14), fontWeight: "800" },
    tourRow: { gap: 8, paddingVertical: 8 },
    tourRowHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    tourTitle: { flex: 1, color: colors.text, fontSize: type.font(15), fontWeight: "800" },
    tourPct: { color: colors.success, fontSize: type.font(14), fontWeight: "800" },
    tourMeta: { color: colors.textSoft, fontSize: type.font(12) },
    smallTrack: { height: 10, borderRadius: 999, overflow: "hidden", backgroundColor: colors.surfaceSoft },
    smallFill: { height: 10, borderRadius: 999, backgroundColor: colors.success }
  });
}
