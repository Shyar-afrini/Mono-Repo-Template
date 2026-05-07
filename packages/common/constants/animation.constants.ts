export const ANIMATION_CONSTANTS = {
  clickable: {
    cursor: {
      whileTap: { scale: 0.99, opacity: 0.96 },
      whileHover: { scale: 1.01, opacity: 0.98 },
    },
    spring: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
      mass: 1,
    },
  },
} as const;
