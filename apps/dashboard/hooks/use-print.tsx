import { cn } from "@/lib/utils";
import { ReactNode, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import logo from "@/assets/images/logo.png";

/**
 * Custom hook for printing content with optional header
 * @param headerShown - Whether to show header in print. Default: true
 * @returns PrintContainer component and TriggerPrint function
 *
 * @example
 * const { PrintContainer, TriggerPrint } = usePrint();
 * const printRef = useRef(null);
 *
 * <PrintContainer ref={printRef}>Content to print</PrintContainer>
 * <button onClick={TriggerPrint}>Print</button>
 */
export function usePrint(
  { headerShown }: { headerShown: boolean } = { headerShown: true }
) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  /**
   * Container for printable content
   * @param children - Content to print
   * @param visible - Show on screen. Default: false (hidden on screen, visible when printing)
   */
  const PrintContainer = ({
    children,
    visible = false,
  }: {
    children: ReactNode;
    visible?: boolean;
  }) => (
    <div
      ref={contentRef}
      className={cn(
        "grid-cols-1 print:p-8",
        visible ? "grid" : "hidden print:grid"
      )}
    >
      {headerShown && (
        <div className="hidden justify-center items-center py-4 mb-4 border-b print:flex">
          <div className="flex flex-col items-center">
            <img src={logo.src} className="object-contain size-20" />
            <h3 className="text-2xl font-semibold text-center">KakonSoft</h3>
          </div>
        </div>
      )}
      {children}
    </div>
  );

  return { PrintContainer, triggerPrint: reactToPrintFn };
}

/**
 * Container for printable content
 * @param children - Content to print
 * @param visible - Show on screen. Default: false (hidden on screen, visible when printing)
 */
export type PrintContainerType = ReturnType<typeof usePrint>["PrintContainer"];
