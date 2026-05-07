"use client";

import React, { useEffect, useState } from "react";
import { Slider } from "../shadcn/ui/slider";
import { cn } from "../../lib/utils";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeSliderProps {
  defaultValue?: number;
  startingValue?: number;
  maxValue?: number;
  className?: string;
  isStepped?: boolean;
  stepSize?: number;
  onValueChange?: (value: number) => void;
  showValue?: boolean;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = "",
  isStepped = false,
  stepSize = 1,
  onValueChange,
  showValue = true,
}) => {
  const [value, setValue] = useState<number[]>([defaultValue]);

  useEffect(() => {
    setValue([defaultValue]);
  }, [defaultValue]);

  useEffect(() => {
    if (onValueChange) {
      onValueChange(value[0]);
    }
  }, [value, onValueChange]);

  const handleValueChange = (newValue: number[]) => {
    let adjustedValue = newValue[0];

    if (isStepped && stepSize > 0) {
      adjustedValue = Math.round(adjustedValue / stepSize) * stepSize;
    }

    adjustedValue = Math.min(Math.max(adjustedValue, startingValue), maxValue);

    setValue([adjustedValue]);
  };

  const leftIcon =
    value[0] === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 w-full",
        className
      )}
    >
      <div className="flex w-full touch-none select-none items-center justify-center gap-4">
        <div className="text-muted-foreground shrink-0">{leftIcon}</div>

        <Slider
          value={value}
          onValueChange={handleValueChange}
          min={startingValue}
          max={maxValue}
          step={isStepped ? stepSize : 1}
          className="flex-1"
        />

        <div className="text-muted-foreground shrink-0">
          <Volume2 size={20} />
        </div>
      </div>
      {showValue && (
        <p className="text-muted-foreground text-xs font-medium tracking-wide">
          {Math.round(value[0])}%
        </p>
      )}
    </div>
  );
};

export default VolumeSlider;
