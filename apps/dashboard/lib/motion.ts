// Banner list variants — stagger parent for the banners grid
export const bannerListVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Individual banner card variants — driven by bannerListVariants stagger
export const bannerCardVariants = {
  initial: {
    opacity: 0,
    scale: 0.94,
    y: 12,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 24,
      mass: 0.8,
    },
  },
};

// Animation list variants used for cameras.tsx component
export const cameraListVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

// Individual camera card variants — driven by cameraListVariants stagger
export const cameraCardVariants = {
  initial: {
    opacity: 0,
    scale: 0.75,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 20,
      mass: 0.7,
    },
  },
}

// Gate animation variants used in gate.tsx component

export const gateVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    top: "-10px",
  },
  animate: {
    opacity: 1,
    scale: 1,
    top: "0px",
  },
};

// Camera details card animation variants used in camera-details.tsx


export const cameraDetailsCardAnimationVairants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    top: -5
  },
  animate: {
    opacity: 1,
    scale: 1,
    top: 0,

  },
  exit: {
    opacity: 0,
    scale: 0.96,
    top: -5,

  }
}
