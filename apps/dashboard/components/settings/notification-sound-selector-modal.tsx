"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Container,
  Flex,
  Button,
  ScrollArea,
  ScrollBar,
  Grid,
  VolumeSlider,
} from "@mono-repo-template/ui";
import { Music, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  NOTIFICATION_SOUNDS,
  getNotificationSoundPreference,
  setNotificationSoundPreference,
  getNotificationVolumePreference,
  setNotificationVolumePreference,
} from "@/utils/notification-sound-preference";
import { playNotificationSound } from "@/lib/playsound";
import { cn } from "@mono-repo-template/utils";

interface NotificationSoundSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Audio Waveform Visual Component
 * Simple visual representation of an audio waveform
 */
const AudioWaveform = ({ isSelected }: { isSelected: boolean }) => {
  // Generate stable heights for waveform bars (between 4 and 20px)
  // Use a stable pattern based on selection state to keep waveform consistent
  const bars = Array.from({ length: 40 }, (_, i) => {
    // Create a pseudo-random but stable value for each bar position
    const seed = i * 7 + (isSelected ? 100 : 0);
    const height = (seed % 16) + 4;
    return { id: `bar-${i}`, height };
  });

  return (
    <Container className="flex-1 overflow-hidden">
      <Flex direction="row" align="center" gap={1} className="h-6 w-full">
        {bars.map((bar) => (
          <div
            key={bar.id}
            className={`min-w-0.5 rounded-full ${
              isSelected ? "dark:bg-zinc-900 bg-zinc-800" : "dark:bg-zinc-500 bg-zinc-400"
            }`}
            style={{ height: `${bar.height}px` }}
          />
        ))}
      </Flex>
    </Container>
  );
};

/**
 * Sound Item Component
 */
const SoundItem = ({
  sound,
  isSelected,
  onSelect,
}: {
  sound: string;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const handleClick = () => {
    // Play the sound when clicked
    playNotificationSound(sound);
    onSelect();
  };

  return (
    <Container
      onClick={handleClick}
      className={`rounded-2xl border p-3 cursor-pointer transition-all duration-300 w-full ${
        isSelected
          ? "dark:bg-zinc-100 bg-zinc-200 dark:border-zinc-800/50 border-zinc-300/50"
          : "dark:bg-zinc-900 bg-zinc-50 dark:border-zinc-800/50 border-zinc-200/50 dark:hover:bg-zinc-800/50 hover:bg-zinc-100/50"
      }`}
    >
      <Flex direction="row" align="center" gap={3}>
        {/* Music Icon Container */}
        <Container
          className={cn(
            "p-3 rounded-lg dark:bg-zinc-800/50 bg-zinc-300/50 shrink-0",
            isSelected && "dark:bg-white bg-zinc-100 dark:border-zinc-800/50 border-zinc-300/50"
          )}
        >
          <Music size={20} className="dark:text-muted-foreground text-zinc-600" />
        </Container>

        {/* Audio Waveform - Always clipped before check mark */}
        <AudioWaveform isSelected={isSelected} />

        {/* Check Icon Container - Always reserve space */}
        <Container className="shrink-0 w-5 flex items-center justify-center">
          {isSelected && <Check size={20} className="dark:text-zinc-900 text-zinc-800" />}
        </Container>
      </Flex>
    </Container>
  );
};

/**
 * Notification Sound Selector Modal
 * Allows users to select and preview notification sounds
 */
export const NotificationSoundSelectorModal = ({
  open,
  onOpenChange,
}: NotificationSoundSelectorModalProps) => {
  const t = useTranslations("settings.tabs.notifications.sound");
  const [selectedSound, setSelectedSound] = useState<string>(
    getNotificationSoundPreference()
  );
  const [volume, setVolume] = useState<number>(
    getNotificationVolumePreference()
  );

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const handleSave = useCallback(() => {
    setNotificationSoundPreference(selectedSound);
    setNotificationVolumePreference(volume);
    onOpenChange(false);
  }, [selectedSound, volume, onOpenChange]);

  const handleCancel = useCallback(() => {
    // Reset to saved preference
    setSelectedSound(getNotificationSoundPreference());
    setVolume(getNotificationVolumePreference());
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:bg-zinc-950 bg-zinc-50 max-w-md w-full p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold dark:text-foreground text-zinc-900">
            {t("modal.title")}
          </DialogTitle>
          <DialogDescription className="text-sm dark:text-muted-foreground text-zinc-600">
            {t("modal.description")}
          </DialogDescription>
        </DialogHeader>

        <Container className="px-6 pb-4">
          <VolumeSlider
            defaultValue={volume}
            onValueChange={handleVolumeChange}
            className="relative"
          />
        </Container>

        <ScrollArea className="max-h-[450px] px-6">
          <Grid cols={2} gap={3} className="pb-4">
            {NOTIFICATION_SOUNDS.map((sound) => (
              <SoundItem
                key={sound}
                sound={sound}
                isSelected={selectedSound === sound}
                onSelect={() => setSelectedSound(sound)}
              />
            ))}
          </Grid>
          <ScrollBar />
        </ScrollArea>

        <DialogFooter className="p-6 pt-4">
          <Flex direction="row" gap={3} className="w-full">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              {t("modal.cancel")}
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {t("modal.save")}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
