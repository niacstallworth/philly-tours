import { io, Socket } from "socket.io-client";

export type SyncEvent =
  | { type: "spawn"; sessionId: string; objectId: string; modelUrl: string }
  | {
      type: "move";
      sessionId: string;
      objectId: string;
      x: number;
      y: number;
      z: number;
    };

type SocketEventPayload = SyncEvent & { senderId: string };

type RoomMembersPayload = {
  sessionId: string;
  members: string[];
};

export class RealtimeSync {
  private socket: Socket | null = null;
  private readonly clientId: string;
  private currentSessionId: string | null = null;

  constructor(private readonly serverUrl: string) {
    this.clientId = Math.random().toString(36).slice(2);
  }

  getClientId() {
    return this.clientId;
  }

  connect() {
    if (this.socket) {
      return;
    }

    this.socket = io(this.serverUrl, {
      transports: ["websocket"],
      autoConnect: true
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.currentSessionId = null;
  }

  joinSession(sessionId: string) {
    this.connect();
    this.currentSessionId = sessionId;
    this.socket?.emit("joinSession", { sessionId, senderId: this.clientId });
    return true;
  }

  leaveSession() {
    if (!this.currentSessionId) {
      return;
    }

    this.socket?.emit("leaveSession", {
      sessionId: this.currentSessionId,
      senderId: this.clientId
    });

    this.currentSessionId = null;
  }

  send(event: SyncEvent) {
    this.connect();
    this.socket?.emit("syncEvent", { ...event, senderId: this.clientId });
  }

  onEvent(listener: (event: SyncEvent) => void) {
    this.connect();

    const handler = (payload: SocketEventPayload) => {
      if (payload.senderId === this.clientId) {
        return;
      }

      listener(payload);
    };

    this.socket?.on("syncEvent", handler);

    return () => {
      this.socket?.off("syncEvent", handler);
    };
  }

  onRoomMembers(listener: (sessionId: string, members: string[]) => void) {
    this.connect();

    const handler = (payload: RoomMembersPayload) => {
      listener(payload.sessionId, payload.members);
    };

    this.socket?.on("roomMembers", handler);

    return () => {
      this.socket?.off("roomMembers", handler);
    };
  }
}

export function createRealtimeSyncFromEnv() {
  return new RealtimeSync(process.env.EXPO_PUBLIC_SYNC_SERVER_URL || "http://localhost:4000");
}
