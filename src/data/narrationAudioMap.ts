export const narrationAudioMap = {
  "/audio/johnson-house-drive.mp3": require("../../assets/audio/johnson-house-drive.mp3"),
  "/audio/johnson-house-walk.mp3": require("../../assets/audio/johnson-house-walk.mp3"),
  "/audio/masonic-temple-drive.mp3": require("../../assets/audio/masonic-temple-drive.mp3"),
  "/audio/masonic-temple-walk.mp3": require("../../assets/audio/masonic-temple-walk.mp3"),
  "/audio/mother-bethel-ame-church-drive.mp3": require("../../assets/audio/mother-bethel-ame-church-drive.mp3"),
  "/audio/mother-bethel-ame-church-walk.mp3": require("../../assets/audio/mother-bethel-ame-church-walk.mp3"),
  "/audio/presidents-house-liberty-bell-center-drive.mp3": require("../../assets/audio/presidents-house-liberty-bell-center-drive.mp3"),
  "/audio/presidents-house-liberty-bell-center-walk.mp3": require("../../assets/audio/presidents-house-liberty-bell-center-walk.mp3"),
  "/audio/the-palestra-drive.mp3": require("../../assets/audio/the-palestra-drive.mp3"),
  "/audio/the-palestra-walk.mp3": require("../../assets/audio/the-palestra-walk.mp3"),
} as const;

export type NarrationAudioPath = keyof typeof narrationAudioMap;

