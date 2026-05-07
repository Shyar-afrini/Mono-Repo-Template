"use client";

import { cn, Text } from "@mono-repo-template/ui";
import { getCurrentTime } from "@mono-repo-template/utils";
import { HTMLAttributes, useEffect, useState } from "react";

interface TimeStampProps extends HTMLAttributes<HTMLDivElement> {
  showTimeStamp: boolean;
}

const TimeStamp = ({ showTimeStamp, className, ...props }: TimeStampProps) => {
  const [timeStamp, setTimeStamp] = useState<string | null>(getCurrentTime());

  useEffect(() => {
    // Set initial timestamp immediately
    setTimeStamp(getCurrentTime());

    // Update every second using setInterval
    const interval = setInterval(() => {
      setTimeStamp(getCurrentTime());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  if (!showTimeStamp) return null;
  
  return (
    <Text className={cn("text-white text-sm", className)} {...props}>
      {timeStamp}
    </Text>
  );
};

export default TimeStamp;
