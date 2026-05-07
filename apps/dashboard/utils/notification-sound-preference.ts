/**
 * Notification Sound Preference Utilities
 * Manages user's notification sound preference in localStorage
 */

const STORAGE_KEY = "dashboard_notification_sound";
const VOLUME_STORAGE_KEY = "dashboard_notification_volume";

/**
 * Default notification sound
 */
export const DEFAULT_NOTIFICATION_SOUND = "/assets/sounds/01.mp3";

/**
 * Available notification sounds
 */
export const NOTIFICATION_SOUNDS: readonly string[] = Array.from(
  // change back to 15 for meme sounds
  { length: 10 },
  (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return `/assets/sounds/${num}.mp3`;
  }
);

/**
 * Get the user's preferred notification sound
 * Returns the default sound if none is set
 */
export const getNotificationSoundPreference = (): string => {
  if (globalThis.window === undefined) return DEFAULT_NOTIFICATION_SOUND;

  try {
    const stored = globalThis.window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_NOTIFICATION_SOUND;

    const sound = stored;
    // Validate that the sound is in the available sounds list
    if (NOTIFICATION_SOUNDS.includes(sound)) {
      return sound;
    }

    // If invalid, reset to default
    return DEFAULT_NOTIFICATION_SOUND;
  } catch (error) {
    console.error("Error reading notification sound preference:", error);
    return DEFAULT_NOTIFICATION_SOUND;
  }
};

/**
 * Set the user's preferred notification sound
 */
export const setNotificationSoundPreference = (sound: string): void => {
  if (globalThis.window === undefined) return;

  try {
    // Validate that the sound is in the available sounds list
    if (!NOTIFICATION_SOUNDS.includes(sound)) {
      console.warn("Invalid notification sound:", sound);
      return;
    }

    globalThis.window.localStorage.setItem(STORAGE_KEY, sound);
  } catch (error) {
    console.error("Error saving notification sound preference:", error);
  }
};

/**
 * Reset to default notification sound
 */
export const resetNotificationSoundPreference = (): void => {
  if (globalThis.window === undefined) return;

  try {
    globalThis.window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error resetting notification sound preference:", error);
  }
};

/**
 * Default notification volume (0-100)
 */
export const DEFAULT_NOTIFICATION_VOLUME = 50;

/**
 * Get the user's preferred notification volume
 * Returns the default volume if none is set
 */
export const getNotificationVolumePreference = (): number => {
  if (globalThis.window === undefined) return DEFAULT_NOTIFICATION_VOLUME;

  try {
    const stored = globalThis.window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (!stored) return DEFAULT_NOTIFICATION_VOLUME;

    const volume = parseInt(stored, 10);
    // Validate that the volume is between 0 and 100
    if (!isNaN(volume) && volume >= 0 && volume <= 100) {
      return volume;
    }

    // If invalid, reset to default
    return DEFAULT_NOTIFICATION_VOLUME;
  } catch (error) {
    console.error("Error reading notification volume preference:", error);
    return DEFAULT_NOTIFICATION_VOLUME;
  }
};

/**
 * Set the user's preferred notification volume
 */
export const setNotificationVolumePreference = (volume: number): void => {
  if (globalThis.window === undefined) return;

  try {
    // Validate that the volume is between 0 and 100
    if (volume < 0 || volume > 100 || isNaN(volume)) {
      console.warn("Invalid notification volume:", volume);
      return;
    }

    globalThis.window.localStorage.setItem(
      VOLUME_STORAGE_KEY,
      volume.toString()
    );
  } catch (error) {
    console.error("Error saving notification volume preference:", error);
  }
};
