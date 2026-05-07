"use client";

import {
    AnimatedButton,
    Calendar,
    Flex,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Text,
} from "@mono-repo-template/ui";
import { format } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { cn } from "@mono-repo-template/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeValue {
    hour: number;   // 1–12
    minute: number; // 0–59
    isPm: boolean;
}

export interface DateTimePickerProps {
    /** Called whenever the user selects or changes the date / time. */
    onChange: (date: Date | undefined) => void;
    /** Pre-selected date (controlled initial value). */
    initialValue?: Date;
    /** Dates before this are disabled in the calendar. */
    minDate?: Date;
    /** Placeholder shown when no date is selected. */
    placeholder?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TIME: TimeValue = { hour: 12, minute: 0, isPm: true };

// ─── Conversion utilities (exported for consumers) ───────────────────────────

/** date-fns locale from the app locale string. */
export const getDateFnsLocale = (locale: string) =>
    locale === "ar" ? arLocale : enUS;

/** Date → microsecond-precision timestamp string (for the banners API). */
export const toMicrosecondsTimestamp = (date: Date): string =>
    (date.getTime() * 1000).toString();

/** Date → ISO 8601 string. */
export const toISOString = (date: Date): string => date.toISOString();

/** Date → compact display string (e.g. "09 Mar, 12:00 PM"). */
export const formatPreviewDate = (date: Date, locale: string): string =>
    format(date, "dd MMM, hh:mm a", { locale: getDateFnsLocale(locale) });

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Merge a calendar day with a 12-hour TimeValue into a single Date. */
const buildDateTime = (date: Date, time: TimeValue): Date => {
    const result = new Date(date);
    let hours = time.hour % 12; // 12 → 0, 1–11 unchanged
    if (time.isPm) hours += 12;
    result.setHours(hours, time.minute, 0, 0);
    return result;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Bare numeric input for hour / minute. */
const TimeInput = ({
    value,
    min,
    max,
    placeholder,
    onChange,
}: {
    value: string;
    min: number;
    max: number;
    placeholder: string;
    onChange: (val: string) => void;
}) => (
    <input
        type="number"
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm text-center border dark:border-zinc-700 border-zinc-200 rounded-lg dark:bg-zinc-900 bg-white dark:text-zinc-100 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
    />
);

/** AM / PM toggle pair. */
const AmPmToggle = ({
    isPm,
    onChange,
}: {
    isPm: boolean;
    onChange: (isPm: boolean) => void;
}) => (
    <Flex direction="row" gap={1}>
        <AnimatedButton
            variant={isPm ? "outline" : "default"}
            size="sm"
            type="button"
            className="min-w-[52px]"
            onClick={() => onChange(false)}
        >
            AM
        </AnimatedButton>
        <AnimatedButton
            variant={isPm ? "default" : "outline"}
            size="sm"
            type="button"
            className="min-w-[52px]"
            onClick={() => onChange(true)}
        >
            PM
        </AnimatedButton>
    </Flex>
);

/** Hour + minute inputs with AM/PM selector. */
const TimePicker = ({
    value,
    onChange,
}: {
    value: TimeValue;
    onChange: (value: TimeValue) => void;
}) => {
    const handleHour = (raw: string) => {
        const n = Number.parseInt(raw, 10);
        if (!Number.isNaN(n) && n >= 1 && n <= 12) {
            onChange({ ...value, hour: n });
        }
    };

    const handleMinute = (raw: string) => {
        const n = Number.parseInt(raw, 10);
        if (!Number.isNaN(n) && n >= 0 && n <= 59) {
            onChange({ ...value, minute: n });
        }
    };

    return (
        <Flex direction="row" align="center" gap={2} className="w-full">
            <Flex direction="row" align="center" gap={1.5} className="flex-1">
                <TimeInput
                    value={value.hour.toString().padStart(2, "0")}
                    min={1}
                    max={12}
                    placeholder="12"
                    onChange={handleHour}
                />
                <Text className="text-muted-foreground font-bold select-none">:</Text>
                <TimeInput
                    value={value.minute.toString().padStart(2, "0")}
                    min={0}
                    max={59}
                    placeholder="00"
                    onChange={handleMinute}
                />
            </Flex>
            <AmPmToggle
                isPm={value.isPm}
                onChange={(isPm) => onChange({ ...value, isPm })}
            />
        </Flex>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Reusable date + time picker.
 *
 * Renders a calendar popover for the date and a 12-hour time input.
 * Calls `onChange` with the fully-merged `Date` every time the user
 * changes either the date or the time.
 *
 * Reset the picker by changing its React `key`.
 */
const DateTimePicker = ({
    onChange,
    initialValue,
    minDate,
    placeholder = "Pick a date",
}: DateTimePickerProps) => {
    const locale = useLocale();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialValue);
    const [time, setTime] = useState<TimeValue>(
        initialValue
            ? {
                  hour: initialValue.getHours() % 12 || 12,
                  minute: initialValue.getMinutes(),
                  isPm: initialValue.getHours() >= 12,
              }
            : DEFAULT_TIME
    );

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setCalendarOpen(false);
        onChange(date ? buildDateTime(date, time) : undefined);
    };

    const handleTimeChange = (newTime: TimeValue) => {
        setTime(newTime);
        if (selectedDate) {
            onChange(buildDateTime(selectedDate, newTime));
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const buttonLabel = selectedDate
        ? format(selectedDate, "PPP", { locale: getDateFnsLocale(locale) })
        : placeholder;

    return (
        <Flex direction="col" gap={3}>
            {/* Calendar popover */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                    <AnimatedButton
                        variant="outline"
                        className={cn(
                            "w-full justify-start font-normal",
                            !selectedDate && "text-muted-foreground",
                        )}
                    >
                        <CalendarIcon className="me-2 h-4 w-4 shrink-0" />
                        {buttonLabel}
                    </AnimatedButton>
                </PopoverTrigger>
                <PopoverContent className="min-w-fit p-0 rounded-xl" align="start">
                    <Calendar
                        className="w-full rounded-xl"
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={minDate ? (date) => date < minDate : undefined}
                        captionLayout="dropdown"
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {/* Time picker — appears once a date is selected */}
            {selectedDate && (
                <TimePicker value={time} onChange={handleTimeChange} />
            )}
        </Flex>
    );
};

export default DateTimePicker;
