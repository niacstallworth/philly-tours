import AsyncStorage from "@react-native-async-storage/async-storage";

export type CommunityRoomTheme = "memory" | "question" | "reflection" | "family" | "archive";
export type CommunityRoomPostStatus = "approved" | "pending" | "hidden";

export type CommunityRoomPost = {
  id: string;
  tourId: string;
  stopId: string;
  authorName: string;
  body: string;
  status: CommunityRoomPostStatus;
  theme: CommunityRoomTheme;
  createdAt: number;
};

const COMMUNITY_ROOM_STORAGE_KEY = "philly_tours_community_room_posts_v1";

const approvedCommunityRoomPosts: CommunityRoomPost[] = [
  {
    id: "approved:mother-bethel-memory",
    tourId: "black-american-legacy-and-quaker-heritage",
    stopId: "black-american-legacy-and-quaker-heritage-mother-bethel-ame-church",
    authorName: "Philadelphia visitor",
    body: "This place feels like a room where faith and freedom learned how to speak out loud.",
    status: "approved",
    theme: "reflection",
    createdAt: Date.UTC(2026, 0, 10)
  },
  {
    id: "approved:johnson-house-archive",
    tourId: "black-american-legacy-and-quaker-heritage",
    stopId: "black-american-legacy-and-quaker-heritage-johnson-house",
    authorName: "Archive prompt",
    body: "Freedom was not abstract here. It moved through rooms, doors, letters, and risk.",
    status: "approved",
    theme: "archive",
    createdAt: Date.UTC(2026, 0, 11)
  },
  {
    id: "approved:latimer-invention",
    tourId: "black-inventors-tour",
    stopId: "black-inventors-tour-lewis-latimer-light-bulb-exhibit",
    authorName: "Founder note",
    body: "Latimer turns invention into inheritance: light, drawings, patents, and the work behind the glow.",
    status: "approved",
    theme: "reflection",
    createdAt: Date.UTC(2026, 0, 12)
  },
  {
    id: "approved:morgan-signal",
    tourId: "black-inventors-tour",
    stopId: "black-inventors-tour-garrett-morgan-traffic-signal",
    authorName: "Archive prompt",
    body: "A traffic signal is a public safety story. Morgan's idea helped cities move with more care.",
    status: "approved",
    theme: "archive",
    createdAt: Date.UTC(2026, 0, 13)
  },
  {
    id: "approved:drew-blood-bank",
    tourId: "black-inventors-tour",
    stopId: "black-inventors-tour-dr-charles-drew-blood-bank",
    authorName: "Philadelphia visitor",
    body: "This room asks us to remember medical genius as care, infrastructure, and survival.",
    status: "approved",
    theme: "reflection",
    createdAt: Date.UTC(2026, 0, 14)
  },
  {
    id: "approved:mercy-douglass",
    tourId: "black-medical-legacy",
    stopId: "black-medical-legacy-mercy-douglass-nurse-training",
    authorName: "Family memory",
    body: "My aunt trained as a nurse in Philadelphia. This honors the people who held the city together.",
    status: "approved",
    theme: "family",
    createdAt: Date.UTC(2026, 0, 15)
  },
  {
    id: "approved:barbara-bates",
    tourId: "black-medical-legacy",
    stopId: "black-medical-legacy-barbara-bates-center",
    authorName: "Archive prompt",
    body: "What gets preserved shapes who gets remembered. This room is for the keepers of care.",
    status: "approved",
    theme: "archive",
    createdAt: Date.UTC(2026, 0, 16)
  },
  {
    id: "approved:joe-frazier",
    tourId: "black-american-sports",
    stopId: "black-american-sports-joe-frazier-s-gym-cloverlay",
    authorName: "Philadelphia visitor",
    body: "This corner still feels like discipline and grit. You can almost hear the bag work.",
    status: "approved",
    theme: "memory",
    createdAt: Date.UTC(2026, 0, 17)
  },
  {
    id: "approved:iverson-courts",
    tourId: "black-american-sports",
    stopId: "black-american-sports-allen-iverson-s-hampton-park-courts",
    authorName: "Philadelphia visitor",
    body: "Every crossover is also a story about style, pressure, and refusing to shrink.",
    status: "approved",
    theme: "reflection",
    createdAt: Date.UTC(2026, 0, 18)
  },
  {
    id: "approved:sonny-hill",
    tourId: "black-american-sports",
    stopId: "black-american-sports-sonny-hill-league-tustin",
    authorName: "Founder note",
    body: "Summer league is civic memory: coaching, mentorship, rivalry, and a court full of witnesses.",
    status: "approved",
    theme: "archive",
    createdAt: Date.UTC(2026, 0, 19)
  }
];

function normalizePendingPosts(value: unknown): CommunityRoomPost[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is CommunityRoomPost => {
    const candidate = entry as Partial<CommunityRoomPost>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.tourId === "string" &&
      typeof candidate.stopId === "string" &&
      typeof candidate.authorName === "string" &&
      typeof candidate.body === "string" &&
      candidate.status === "pending" &&
      typeof candidate.theme === "string" &&
      typeof candidate.createdAt === "number"
    );
  });
}

async function loadPendingPosts() {
  try {
    const raw = await AsyncStorage.getItem(COMMUNITY_ROOM_STORAGE_KEY);
    return raw ? normalizePendingPosts(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

async function savePendingPosts(posts: CommunityRoomPost[]) {
  await AsyncStorage.setItem(COMMUNITY_ROOM_STORAGE_KEY, JSON.stringify(posts));
}

export async function getCommunityRoomPosts(stopId: string) {
  const pendingPosts = await loadPendingPosts();
  return [...approvedCommunityRoomPosts, ...pendingPosts]
    .filter((post) => post.stopId === stopId && post.status !== "hidden")
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "approved" ? -1 : 1;
      }
      return right.createdAt - left.createdAt;
    });
}

export async function submitCommunityRoomPost(input: {
  tourId: string;
  stopId: string;
  authorName?: string;
  body: string;
  theme?: CommunityRoomTheme;
}) {
  const body = input.body.trim();
  if (body.length < 8) {
    throw new Error("Write a little more before submitting this reflection.");
  }
  const pendingPosts = await loadPendingPosts();
  const nextPost: CommunityRoomPost = {
    id: `pending:${input.stopId}:${Date.now()}`,
    tourId: input.tourId,
    stopId: input.stopId,
    authorName: input.authorName?.trim() || "Philadelphia visitor",
    body,
    status: "pending",
    theme: input.theme || "reflection",
    createdAt: Date.now()
  };
  await savePendingPosts([nextPost, ...pendingPosts].slice(0, 50));
  return nextPost;
}

export async function getPendingCommunityRoomPostCount() {
  return (await loadPendingPosts()).length;
}
