import React, { useEffect, useRef, useState } from "react";
import { evaluate, number } from "mathjs";
import { Input } from "../components";
import { cn } from "../lib/utils";

export const MONEY_FRACTION_DIGITS_MAX = 8;

/** Single-number input: digits, one decimal point, optional commas (stripped). */
export function sanitizeMoneyInputRaw(raw: string): string {
  const cleaned = (raw ?? "").replace(/,/g, "").replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  if (dot === -1) return cleaned;
  return cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, "");
}

export function limitMoneyFraction(sanitized: string, maxFrac: number): string {
  const dot = sanitized.indexOf(".");
  if (dot === -1) return sanitized;
  return sanitized.slice(0, dot + 1 + maxFrac);
}

/** Form state number from a sanitized single-amount string (trailing "." allowed while typing). */
export function moneyStringToNumber(sanitized: string): number {
  if (sanitized === "" || sanitized === ".") return 0;
  const withoutTrailingDot = sanitized.endsWith(".")
    ? sanitized.slice(0, -1)
    : sanitized;
  if (withoutTrailingDot === "") return 0;
  const n = Number.parseFloat(withoutTrailingDot);
  return Number.isFinite(n) ? n : 0;
}

export function coerceMoneyFieldValue(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = Number.parseFloat(value.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatMoneyFieldDisplay(value: unknown, numeric: number): string {
  if (value === "" || value === null || value === undefined) return "";
  if (!Number.isFinite(numeric)) return "";
  const seed = numberToSanitizedEditSeed(numeric);
  return formatMoneyDraftDisplay(sanitizeMoneyInputRaw(seed));
}

export function numberToSanitizedEditSeed(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "0";
  return n.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: MONEY_FRACTION_DIGITS_MAX,
  });
}

const intlInteger = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const intlFullNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: MONEY_FRACTION_DIGITS_MAX,
  minimumFractionDigits: 0,
});

export function formatMoneyDraftDisplay(sanitized: string): string {
  if (sanitized === "") return "";

  const dot = sanitized.indexOf(".");
  if (dot === -1) {
    const n = Number.parseInt(sanitized, 10);
    if (!Number.isFinite(n)) return "";
    return intlFullNumber.format(n);
  }

  const intRaw = sanitized.slice(0, dot);
  const rest = sanitized.slice(dot + 1);
  const endsWithDotOnly = rest === "";

  const intNum = intRaw === "" ? 0 : Number.parseInt(intRaw, 10);
  const intSafe = Number.isFinite(intNum) ? intNum : 0;
  const intGrouped = intlInteger.format(intSafe);
  const intDisplay = intRaw === "" && rest !== "" ? "0" : intGrouped;

  if (endsWithDotOnly) {
    return `${intDisplay}.`;
  }

  const fracDigits = rest.replace(/\D/g, "").slice(0, MONEY_FRACTION_DIGITS_MAX);
  return `${intDisplay}.${fracDigits}`;
}

/** Allows typing arithmetic e.g. `235,000 + 12,500`, `(100+50)*2`, `125%7`. */
export function sanitizeMoneyMathRaw(raw: string): string {
  return (raw ?? "")
    .replace(/[^\d,.\s+\-*/()%]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isExpressionDraft(s: string): boolean {
  const t = s.replace(/\s/g, "").replace(/,/g, "");
  if (!t) return false;
  if (/[-()+*/%]/.test(t)) return true;
  return /\d-\d/.test(t);
}

const MONEY_EXPR_NUMBER_TOKEN = /[\d,]+(?:\.[\d,]*)?/g;

/** Adds thousands grouping to every numeric literal in an expression draft (e.g. `12,000+15000` → `12,000+15,000`). */
export function formatMoneyExpressionDisplay(mathSanitized: string): string {
  if (!mathSanitized) return "";
  return mathSanitized.replace(MONEY_EXPR_NUMBER_TOKEN, (token) => {
    const inner = sanitizeMoneyInputRaw(token);
    if (inner === "" || inner === ".") return token;
    return formatMoneyDraftDisplay(inner);
  });
}

/** Only digits and basic arithmetic tokens — blocks identifiers before mathjs. */
const MONEY_MATH_SAFE = /^[\d+\-*/().%]+$/;

/**
 * Evaluates a simple arithmetic expression with mathjs (+, -, *, /, %, parentheses, decimals).
 * Commas and spaces are stripped; only characters matching MONEY_MATH_SAFE are accepted.
 */
export function evaluateMoneyExpression(expr: string): number | null {
  const compact = expr.replace(/,/g, "").replace(/\s/g, "");
  if (!compact) return null;
  if (!MONEY_MATH_SAFE.test(compact)) return null;
  try {
    const result = evaluate(compact);
    const n = number(result);
    if (!Number.isFinite(n)) return null;
    return n;
  } catch {
    return null;
  }
}

type TryFinalizeResult =
  | { ok: true; value: number }
  | { ok: false; reason: "invalid_expression" };

function tryFinalizeDraft(
  draftDisplay: string,
  fallback: number
): TryFinalizeResult {
  const math = sanitizeMoneyMathRaw(draftDisplay);
  if (!math) return { ok: true, value: fallback };

  if (isExpressionDraft(math)) {
    const ev = evaluateMoneyExpression(math);
    if (ev === null || !Number.isFinite(ev)) {
      return { ok: false, reason: "invalid_expression" };
    }
    return { ok: true, value: ev };
  }

  return {
    ok: true,
    value: moneyStringToNumber(
      limitMoneyFraction(
        sanitizeMoneyInputRaw(draftDisplay),
        MONEY_FRACTION_DIGITS_MAX
      )
    ),
  };
}

export type MoneyFieldInputProps = {
  id: string;
  fieldValue: unknown;
  onChange: (n: number) => void;
  onBlur: () => void;
  disabled?: boolean;
  placeholder?: string;
  inputClassName?: string;
  hasError: boolean;
  externalState?: { setValue: (value: unknown) => void };
};

export const MoneyFieldInput: React.FC<MoneyFieldInputProps> = ({
  id,
  fieldValue,
  onChange,
  onBlur,
  disabled,
  placeholder,
  inputClassName,
  hasError,
  externalState,
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const focusedRef = useRef(false);

  const numeric = coerceMoneyFieldValue(fieldValue);

  useEffect(() => {
    if (!focusedRef.current) setDraft(null);
  }, [fieldValue]);

  const display =
    draft !== null ? draft : formatMoneyFieldDisplay(fieldValue, numeric);

  const pushValue = (n: number) => {
    onChange(n);
    externalState?.setValue(n);
  };

  const applyFormattedResult = (value: number) => {
    pushValue(value);
    setDraft(
      formatMoneyDraftDisplay(
        sanitizeMoneyInputRaw(numberToSanitizedEditSeed(value))
      )
    );
  };

  return (
    <Input
      id={id}
      inputMode="text"
      autoComplete="off"
      placeholder={placeholder}
      value={display}
      onFocus={() => {
        focusedRef.current = true;
        if (fieldValue === "" || fieldValue === null || fieldValue === undefined) {
          setDraft("");
          return;
        }
        const seed = numberToSanitizedEditSeed(numeric);
        setDraft(formatMoneyDraftDisplay(sanitizeMoneyInputRaw(seed)));
      }}
      onChange={(e) => {
        const raw = e.target.value ?? "";
        const math = sanitizeMoneyMathRaw(raw);

        if (isExpressionDraft(math)) {
          setDraft(formatMoneyExpressionDisplay(math));
          return;
        }

        const sanitized = limitMoneyFraction(
          sanitizeMoneyInputRaw(raw),
          MONEY_FRACTION_DIGITS_MAX
        );
        setDraft(formatMoneyDraftDisplay(sanitized));
        pushValue(moneyStringToNumber(sanitized));
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (draft === null) return;

        const result = tryFinalizeDraft(draft, numeric);
        if (!result.ok) return;

        applyFormattedResult(result.value);
      }}
      onBlur={() => {
        focusedRef.current = false;
        const source = draft ?? "";
        const result = tryFinalizeDraft(source, numeric);
        const finalized = result.ok ? result.value : numeric;
        pushValue(finalized);
        setDraft(null);
        onBlur();
      }}
      disabled={disabled}
      className={cn(
        hasError && "border-destructive focus-visible:ring-destructive w-full",
        inputClassName
      )}
    />
  );
};
