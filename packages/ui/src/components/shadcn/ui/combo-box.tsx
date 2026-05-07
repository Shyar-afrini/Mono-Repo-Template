"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/utils";
import { Flex } from "../../containers";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Text } from "../../typography";
import { AnimatedButton } from "../../buttons";

export function ComboBox({
  trigger,
  data,
  label,
  defaultValue,
  placeholder,
  emptyMessage = "No item found.",
  required = false,
  onValueChange,
}: Readonly<{
  trigger?: React.ReactNode;
  data?: { value: string; label: string }[];
  label: string;
  defaultValue?: string;
  placeholder: string;
  emptyMessage: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
}>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>();

  React.useLayoutEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const update = () => setTriggerWidth(el.getBoundingClientRect().width);
    update();
    // update on resize
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Flex direction="column" gap={2} className="w-full min-w-full">
        <PopoverTrigger
          asChild
          ref={triggerRef as React.RefObject<HTMLButtonElement>}
        >
          <Flex direction="column" gap={2} className="w-full">
            <Label htmlFor={label} className="text-sm font-medium">
              {label}
              {required && (
                <Text small className="text-destructive ml-1">
                  *
                </Text>
              )}
            </Label>
            {trigger ?? (
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                id={label}
                className={cn(
                  "w-full justify-between h-10",
                  value
                    ? "text-foreground hover:text-foreground"
                    : "text-muted-foreground hover:text-muted-foreground"
                )}
              >
                {value
                  ? data?.find((item) => item.value === value)?.label
                  : placeholder}
                <ChevronDown className="opacity-50" />
              </Button>
            )}
          </Flex>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={triggerWidth ? { width: `${triggerWidth}px` } : undefined}
        >
          <Command>
            <CommandInput placeholder={placeholder} className="h-auto py-3" />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {data?.map((item) => (
                  <CommandItem
                    className="py-2.5"
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue: string) => {
                      const newValue =
                        currentValue === value ? defaultValue : currentValue;
                      setValue(newValue);
                      setOpen(false);
                      if (onValueChange && newValue) {
                        onValueChange(newValue);
                      }
                    }}
                  >
                    {item.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Flex>
    </Popover>
  );
}
