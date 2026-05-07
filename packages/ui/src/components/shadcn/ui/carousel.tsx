"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "./button";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  initialIndex?: number;
}

interface CarouselContextValue {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  totalSlides: number;
  goToSlide: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
}

const CarouselContext = React.createContext<CarouselContextValue | undefined>(
  undefined,
);

const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("Carousel components must be used within a Carousel");
  }
  return context;
};

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      className,
      autoPlay = false,
      interval = 5000,
      initialIndex = 0,
      ...props
    },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const [totalSlides, setTotalSlides] = React.useState(0);

    const goToSlide = React.useCallback((index: number) => {
      setCurrentIndex(index);
    }, []);

    const goToNext = React.useCallback(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const goToPrevious = React.useCallback(() => {
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    // Auto-play functionality
    React.useEffect(() => {
      if (!autoPlay || totalSlides <= 1) return;

      const timer = setInterval(() => {
        goToNext();
      }, interval);

      return () => clearInterval(timer);
    }, [autoPlay, interval, goToNext, totalSlides]);

    const contextValue = React.useMemo<CarouselContextValue>(
      () => ({
        currentIndex,
        setCurrentIndex,
        totalSlides,
        goToSlide,
        goToNext,
        goToPrevious,
      }),
      [currentIndex, totalSlides, goToSlide, goToNext, goToPrevious],
    );

    // Count children
    React.useEffect(() => {
      const childrenArray = React.Children.toArray(children);
      setTotalSlides(childrenArray.length);
    }, [children]);

    // Update currentIndex when initialIndex changes
    React.useEffect(() => {
      if (initialIndex >= 0 && initialIndex < totalSlides) {
        setCurrentIndex(initialIndex);
      }
    }, [initialIndex, totalSlides]);

    return (
      <CarouselContext.Provider value={contextValue}>
        <div ref={ref} className={cn("relative w-full", className)} {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  hideSideImages?: boolean;
}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, hideSideImages = false, ...props }, ref) => {
    const { currentIndex, totalSlides } = useCarousel();

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center w-full overflow-hidden",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-center w-full gap-2">
          {React.Children.map(props.children, (child, index) => {
            const isActive = index === currentIndex;
            const isPrevious =
              index === (currentIndex - 1 + totalSlides) % totalSlides;
            const isNext = index === (currentIndex + 1) % totalSlides;

            if (hideSideImages && !isActive) {
              return null;
            }

            return (
              <div
                key={index}
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  isActive && "flex-1",
                  !hideSideImages && isPrevious && "w-25 opacity-50",
                  !hideSideImages && isNext && "w-25 opacity-50",
                  !hideSideImages &&
                    !isActive &&
                    !isPrevious &&
                    !isNext &&
                    "hidden",
                  hideSideImages && !isActive && "hidden",
                )}
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0", className)}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { goToPrevious, totalSlides } = useCarousel();

  if (totalSlides <= 1) return null;

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn(
        "absolute left-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90",
        className,
      )}
      onClick={goToPrevious}
      {...props}
    >
      <ChevronLeft className="w-4 h-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { goToNext, totalSlides } = useCarousel();

  if (totalSlides <= 1) return null;

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90",
        className,
      )}
      onClick={goToNext}
      {...props}
    >
      <ChevronRight className="w-4 h-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
