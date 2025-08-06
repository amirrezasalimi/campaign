import { forwardRef } from "react";
import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import {
  Textarea as HeroUITextarea,
  type TextAreaProps as HeroUITextareaProps,
} from "@heroui/react";

interface FormTextareaProps<T extends FieldValues>
  extends Omit<HeroUITextareaProps, "name" | "ref"> {
  name: FieldPath<T>;
  rules?: RegisterOptions<T>;
}

function FormTextareaComponent<T extends FieldValues>(
  { name, rules, ...props }: FormTextareaProps<T>,
  ref: React.Ref<HTMLTextAreaElement>
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
        <HeroUITextarea
          ref={fieldRef || ref}
          name={fieldName}
          value={value || ""}
          onValueChange={onChange}
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

FormTextareaComponent.displayName = "FormTextarea";

export const FormTextarea = forwardRef(FormTextareaComponent) as <
  T extends FieldValues
>(
  props: FormTextareaProps<T> & { ref?: React.Ref<HTMLTextAreaElement> }
) => ReturnType<typeof FormTextareaComponent>;
