import {
  getNotificationSoundPreference,
  getNotificationVolumePreference,
} from "@/utils/notification-sound-preference";

export const DEFAULT_SOUND = "/assets/sounds/01.mp3";

export const playNotificationSound = (notificationSound?: string) => {
  try {
    // Use provided sound or get user's preference from localStorage
    const soundToPlay = notificationSound || getNotificationSoundPreference();
    const volume = getNotificationVolumePreference() / 100; // Convert 0-100 to 0-1
    const sound = new Audio(soundToPlay);
    sound.volume = volume;
    sound.play();
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};
