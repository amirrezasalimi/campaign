import { forwardRef } from "react";
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import {
  Select as HeroUISelect,
  type SelectProps as HeroUISelectProps,
} from "@heroui/react";

interface FormSelectProps<T extends FieldValues>
  extends Omit<
    HeroUISelectProps,
    "name" | "ref" | "selectedKeys" | "onSelectionChange"
  > {
  name: FieldPath<T>;
  rules?: RegisterOptions<T>;
}

function FormSelectComponent<T extends FieldValues>(
  { name, rules, children, ...props }: FormSelectProps<T>,
  ref: React.Ref<HTMLSelectElement>
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
      }) => (
        <HeroUISelect
          ref={fieldRef || ref}
          name={fieldName}
          selectedKeys={value ? [value] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            onChange(selectedKey);
          }}
          onBlur={onBlur}
          isInvalid={invalid}
          errorMessage={error?.message}
          validationBehavior="aria"
          {...props}
        >
          {children}
        </HeroUISelect>
      )}
    />
  );
}

FormSelectComponent.displayName = "FormSelect";

export const FormSelect = forwardRef(FormSelectComponent) as <
  T extends FieldValues
>(
  props: FormSelectProps<T> & { ref?: React.Ref<HTMLSelectElement> }
) => ReturnType<typeof FormSelectComponent>;
