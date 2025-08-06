import { forwardRef } from "react";
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import {
  DatePicker as HeroUIDatePicker,
  type DatePickerProps as HeroUIDatePickerProps,
} from "@heroui/react";
import { parseDate, type DateValue } from "@internationalized/date";

// Normalize incoming string to ISO date-only (YYYY-MM-DD) or return null
function normalizeToISODateString(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  // Split on 'T' or space to separate potential time component
  const datePart = trimmed.split(/[T ]/)[0];

  // Basic YYYY-MM-DD check
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return null;
  }

  return datePart;
}

interface FormDatePickerProps<T extends FieldValues>
  extends Omit<
    HeroUIDatePickerProps,
    "name" | "ref" | "value" | "onChange" | "onBlur"
  > {
  name: FieldPath<T>;
  rules?: RegisterOptions<T>;
}

function FormDatePickerComponent<T extends FieldValues>(
  { name, rules, ...props }: FormDatePickerProps<T>,
  ref: React.Ref<HTMLInputElement>
) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { name: fieldName, value, onChange, onBlur, ref: fieldRef },
        fieldState: { invalid, error },
      }) => {
        const dateValue: DateValue | null = (() => {
          if (typeof value === "string" && value.length > 0) {
            const normalized = normalizeToISODateString(value);
            if (normalized) {
              try {
                return parseDate(normalized);
              } catch {
                // swallow and fall through to null
              }
            }
          }
          return null;
        })();

        return (
          <HeroUIDatePicker
            ref={fieldRef || ref}
            name={fieldName}
            value={dateValue}
            onChange={(date) => {
              if (date) {
                // Convert DateValue back to ISO string
                const isoString = date.toString();
                onChange(isoString);
              } else {
                onChange(""); // Clear value if date is null
              }
            }}
            onBlur={onBlur}
            isInvalid={invalid}
            errorMessage={error?.message}
            validationBehavior="aria"
            {...props}
          />
        );
      }}
    />
  );
}

FormDatePickerComponent.displayName = "DatePicker";

export const FormDatePicker = forwardRef(FormDatePickerComponent) as <
  T extends FieldValues
>(
  props: FormDatePickerProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => ReturnType<typeof FormDatePickerComponent>;
