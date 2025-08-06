import { forwardRef } from "react";
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import {
  Input as HeroUIInput,
  type InputProps as HeroUIInputProps,
} from "@heroui/react";

interface FormInputProps<T extends FieldValues>
  extends Omit<HeroUIInputProps, "name" | "ref"> {
  name: FieldPath<T>;
  rules?: RegisterOptions<T>;
}

function FormInputComponent<T extends FieldValues>(
  { name, rules, ...props }: FormInputProps<T>,
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
      }) => (
        <HeroUIInput
          ref={fieldRef || ref}
          name={fieldName}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          isInvalid={invalid}
          errorMessage={error?.message}
          validationBehavior="aria"
          {...props}
        />
      )}
    />
  );
}

FormInputComponent.displayName = "FormInput";

export const FormInput = forwardRef(FormInputComponent) as <
  T extends FieldValues
>(
  props: FormInputProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => ReturnType<typeof FormInputComponent>;
