import React, { useState } from "react";
import { ReactFormExtendedApi } from "@tanstack/react-form";
import {
  Flex,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
  Button,
  ScrollBar,
  Switch,
  Text,
} from "../components";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { MoneyFieldInput } from "./money-field-input";

type FieldControlProps = {
  fieldApi: any;
  name: string;
  type: FieldType;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  inputClassName?: string;
  options?: SelectOption[];
  isLoading?: boolean;
  hasError: boolean;
  externalState?: {
    setValue: (value: any) => void;
  };
};

const FieldControl = ({
  fieldApi,
  name,
  type,
  placeholder,
  maxLength,
  disabled,
  inputClassName,
  options,
  isLoading,
  hasError,
  externalState,
}: FieldControlProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  // External state is write-only; the form field value is the source of truth
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (type === "select") {
    return (
      <Select
        value={fieldApi.state.value || ""}
        onValueChange={(value: string) => {
          fieldApi.handleChange(value);
          if (externalState) externalState.setValue(value);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={name}
          className={cn(
            hasError &&
              "border-destructive focus-visible:ring-destructive w-full",
            inputClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full">
          <ScrollArea className=" max-h-40">
            {options?.map((option) => (
              <SelectItem
                id={option.value}
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </SelectContent>
      </Select>
    );
  }

  if (type === "textarea") {
    return (
      <Textarea
        id={name}
        placeholder={placeholder}
        value={fieldApi.state.value || ""}
        onChange={(e) => {
          fieldApi.handleChange(e.target.value);
          if (externalState) externalState.setValue(e.target.value);
        }}
        onBlur={fieldApi.handleBlur}
        disabled={disabled}
      />
    );
  }

  if (type === "date") {
    return (
      <input
        id={name}
        type="date"
        placeholder={placeholder}
        value={fieldApi.state.value || ""}
        onChange={(e) => {
          fieldApi.handleChange(e.target.value);
          if (externalState) externalState.setValue(e.target.value);
        }}
        onBlur={fieldApi.handleBlur}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-destructive focus-visible:ring-destructive",
          inputClassName
        )}
      />
    );
  }

  if (type === "password") {
    return (
      <div className="relative w-full">
        <Input
          id={name}
          type={passwordVisible ? "text" : "password"}
          placeholder={placeholder}
          value={fieldApi.state.value || ""}
          onChange={(e) => {
            fieldApi.handleChange(e.target.value);
            if (externalState) externalState.setValue(e.target.value);
          }}
          onBlur={fieldApi.handleBlur}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            hasError &&
              "border-destructive focus-visible:ring-destructive w-full",
            inputClassName,
            ""
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setPasswordVisible((prev) => !prev)}
          className="absolute inset-y-0 end-0 me-1 text-muted-foreground hover:text-foreground p-1.5 hover:bg-transparent"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
        >
          {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>
    );
  }

  return (
    <Input
      id={name}
      type={type}
      placeholder={placeholder}
      value={fieldApi.state.value || ""}
      onChange={(e) => {
        fieldApi.handleChange(e.target.value);
        if (externalState) externalState.setValue(e.target.value);
      }}
      onBlur={fieldApi.handleBlur}
      disabled={disabled}
      maxLength={maxLength}
      className={cn(
        hasError && "border-destructive focus-visible:ring-destructive w-full",
        inputClassName
      )}
    />
  );
};

// Validation messages type (keep aligned with `@mono-repo-template/types` ValidationMessages)
export type ValidationMessages = {
  required?: string;
  minLength?: string;
  maxLength?: string;
  invalid?: string;
  future?: string;
  /** Cross-field validation (e.g. destination must differ from source). */
  sameAsSource?: string;
  /** Amount or value must not exceed an available balance. */
  exceedsBalance?: string;
  /** Selected value must differ from a paired field (e.g. currency pair). */
  sameCurrency?: string;
};

// Base field types supported
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "money"
  | "file"
  | "tel"
  | "url"
  | "date"
  | "select"
  | "textarea"
  | "switch";

// Select option type
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// Validation function type
export type ValidationFunction = (
  value: any,
  messages?: ValidationMessages
) => string | undefined;

// Form field schema interface
export interface FormSchemaRendererProps {
  name: string;
  label: string;
  /** Used by switch fields to show helper copy under the title */
  description?: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  hidden?: boolean;
  maxLength?: number;
  validation?: {
    onChange?: ValidationFunction;
    onBlur?: ValidationFunction;
    onSubmit?: ValidationFunction;
  };
  validationMessages?: ValidationMessages;
  // Select-specific props
  options?: SelectOption[];
  // Loading state for async data
  isLoading?: boolean;
  // Custom styling
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
  defaultValue?: any;
  // Optional external state binding (e.g., useState) for this field
  externalState?: {
    setValue: (value: any) => void;
  };
}

// Custom component schema interface
export interface CustomComponentSchema {
  customComponent: React.ReactNode;
}

// Union type for schema items - can be a field, array of fields (horizontal), or custom component
export type FormFieldSchema =
  | FormSchemaRendererProps
  | FormSchemaRendererProps[]
  | CustomComponentSchema;

interface FormSchemaRendererComponentProps {
  schema: FormFieldSchema[];
  form: ReactFormExtendedApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  className?: string;
  fieldWrapperClassName?: string;
  validationMessages?: ValidationMessages;
}

// Helper to check if item is a custom component
const isCustomComponent = (
  item: FormFieldSchema
): item is CustomComponentSchema => {
  return (
    typeof item === "object" &&
    item !== null &&
    !Array.isArray(item) &&
    "customComponent" in item
  );
};

// Helper to render a single field
const renderField = (
  field: FormSchemaRendererProps,
  form: any,
  fieldWrapperClassName?: string,
  globalValidationMessages?: ValidationMessages
) => {
  const {
    name,
    label,
    description,
    placeholder,
    type,
    required,
    hidden,
    validation,
    maxLength,
    validationMessages: fieldValidationMessages,
    options,
    isLoading,
    className: fieldClassName,
    inputClassName,
    labelClassName,
    errorClassName,
    disabled,
    externalState,
  } = field;

  // Use field-specific messages if provided, otherwise fall back to global messages
  const messages = fieldValidationMessages || globalValidationMessages;

  if (hidden) {
    return null;
  }

  if (type === "switch") {
    return (
      <form.Field
        key={name}
        name={name}
        validators={{
          onChange: validation?.onChange
            ? ({ value }: { value: any }) =>
                validation.onChange!(value, messages)
            : undefined,
          onBlur: validation?.onBlur
            ? ({ value }: { value: any }) => validation.onBlur!(value, messages)
            : undefined,
          onSubmit: validation?.onSubmit
            ? ({ value }: { value: any }) =>
                validation.onSubmit!(value, messages)
            : undefined,
        }}
      >
        {(fieldApi: any) => (
          <Flex
            align="center"
            justify="between"
            className={cn(
              fieldWrapperClassName,
              fieldClassName,
              "w-full rounded-xl border border-border dark:border-zinc-800 bg-secondary/20 dark:bg-zinc-900/30 px-4 py-3"
            )}
          >
            <Flex direction="column" gap={1} className="min-w-0">
              <Text
                span
                className={cn(
                  "text-sm font-medium text-foreground dark:text-zinc-100",
                  fieldApi.state.meta.errors.length > 0 && "text-destructive",
                  labelClassName
                )}
              >
                {label}
                {required && <span className="text-destructive ms-1">*</span>}
              </Text>
              {field.description ? (
                <Text
                  span
                  className="text-xs text-muted-foreground dark:text-zinc-500"
                >
                  {field.description}
                </Text>
              ) : null}

              {fieldApi.state.meta.errors.length > 0 ? (
                <Text
                  span
                  className={cn(
                    "text-xs font-medium text-destructive",
                    errorClassName
                  )}
                >
                  {fieldApi.state.meta.errors[0]}
                </Text>
              ) : null}
            </Flex>

            <Switch
              checked={!!fieldApi.state.value}
              onCheckedChange={(checked: boolean) => {
                fieldApi.handleChange(checked);
                if (externalState) externalState.setValue(checked);
              }}
              disabled={disabled}
            />
          </Flex>
        )}
      </form.Field>
    );
  }

  return (
    <form.Field
      key={name}
      name={name}
      validators={{
        onChange: validation?.onChange
          ? ({ value }: { value: any }) => validation.onChange!(value, messages)
          : undefined,
        onBlur: validation?.onBlur
          ? ({ value }: { value: any }) => validation.onBlur!(value, messages)
          : undefined,
        onSubmit: validation?.onSubmit
          ? ({ value }: { value: any }) => validation.onSubmit!(value, messages)
          : undefined,
      }}
    >
      {(fieldApi: any) => {
        const hasError = fieldApi.state.meta.errors.length > 0;

        if (type === "money") {
          return (
            <Flex
              direction="column"
              gap={2}
              className={cn(fieldWrapperClassName, fieldClassName, "w-full")}
            >
              <Label
                htmlFor={name}
                className={cn(hasError && "text-destructive", labelClassName)}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {description ? (
                <Text
                  span
                  className="text-xs text-muted-foreground dark:text-zinc-500"
                >
                  {description}
                </Text>
              ) : null}

              <MoneyFieldInput
                id={name}
                fieldValue={fieldApi.state.value}
                onChange={(n) => {
                  fieldApi.handleChange(n);
                }}
                onBlur={fieldApi.handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                inputClassName={inputClassName}
                hasError={hasError}
                externalState={externalState}
              />

              {hasError && (
                <p
                  className={cn(
                    "text-sm font-medium text-destructive",
                    errorClassName
                  )}
                >
                  {fieldApi.state.meta.errors[0]}
                </p>
              )}
            </Flex>
          );
        }

        return (
          <Flex
            direction="column"
            gap={2}
            className={cn(fieldWrapperClassName, fieldClassName, "w-full")}
          >
            <Label
              htmlFor={name}
              className={cn(hasError && "text-destructive", labelClassName)}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>

            <FieldControl
              fieldApi={fieldApi}
              name={name}
              type={type}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={disabled}
              inputClassName={inputClassName}
              options={options}
              isLoading={isLoading}
              hasError={hasError}
              externalState={externalState}
            />

            {/* Error message */}
            {hasError && (
              <p
                className={cn(
                  "text-sm font-medium text-destructive",
                  errorClassName
                )}
              >
                {fieldApi.state.meta.errors[0]}
              </p>
            )}
          </Flex>
        );
      }}
    </form.Field>
  );
};

const FormSchemaRenderer = ({
  schema,
  form,
  className,
  fieldWrapperClassName,
  validationMessages,
}: FormSchemaRendererComponentProps) => {
  return (
    <div className={cn("space-y-4 w-full", className)}>
      {schema.map((item, index) => {
        // Handle custom components
        if (isCustomComponent(item)) {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={`custom-component-${index}`}>
              {item.customComponent}
            </React.Fragment>
          );
        }

        // Handle horizontal layout (array of fields)
        if (Array.isArray(item)) {
          // Generate unique key from field names in the array
          const groupKey = item.map((f) => f.name).join("-");
          return (
            <Flex key={`horizontal-${groupKey}`} gap={4} className="w-full">
              {item.map((field) =>
                renderField(
                  field,
                  form,
                  fieldWrapperClassName,
                  validationMessages
                )
              )}
            </Flex>
          );
        }

        // Handle regular single field
        return renderField(
          item,
          form,
          fieldWrapperClassName,
          validationMessages
        );
      })}
    </div>
  );
};

export default FormSchemaRenderer;
