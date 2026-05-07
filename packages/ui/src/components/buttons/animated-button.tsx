"use client";
import React from "react";
import { motion } from "motion/react";
import { Button, type ButtonProps } from "../shadcn/ui/button";
import { ANIMATION_CONSTANTS } from "@mono-repo-template/common";
import { Flex } from "../containers";
import { Loader } from "lucide-react";
import { cn } from "../../lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const AnimatedButton = ({
  children,
  isLoading,
  loadingText,
  disabled,
  className,
  variant,
  fullWidth,
  ...props
}: AnimatedButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <motion.div
      whileHover={
        !isDisabled
          ? ANIMATION_CONSTANTS.clickable.cursor.whileHover
          : undefined
      }
      whileTap={
        !isDisabled ? ANIMATION_CONSTANTS.clickable.cursor.whileTap : undefined
      }
      transition={ANIMATION_CONSTANTS.clickable.spring}
      className={cn(fullWidth && "w-full")}
    >
      <Button
        variant={variant}
        className={cn(className, isDisabled && "opacity-50 cursor-not-allowed")}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <Flex align="center" gap={2} direction="row-reverse">
            <Loader className="w-4 h-4 animate-spin" />
            {loadingText && loadingText}
          </Flex>
        ) : (
          children
        )}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;
