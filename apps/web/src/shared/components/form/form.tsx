import React, { forwardRef, useImperativeHandle, type ReactNode } from "react";
import {
  useForm,
  FormProvider,
  type SubmitHandler,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
  type Resolver,
} from "react-hook-form";

interface FormProps<T extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  children: ReactNode;
  onSubmit: SubmitHandler<T>;
  defaultValues?: UseFormProps<T>["defaultValues"];
  // Allow resolver input to be broader than T (e.g., raw form values before coercion)
  validationSchema?: Resolver<any, any, T>;
  mode?: UseFormProps<T>["mode"];
  criteriaMode?: UseFormProps<T>["criteriaMode"];
  shouldFocusError?: UseFormProps<T>["shouldFocusError"];
  shouldUnregister?: UseFormProps<T>["shouldUnregister"];
  shouldUseNativeValidation?: UseFormProps<T>["shouldUseNativeValidation"];
  delayError?: UseFormProps<T>["delayError"];
}

function FormComponent<T extends FieldValues>(
  {
    defaultValues,
    validationSchema,
    children,
    onSubmit,
    mode = "onBlur",
    criteriaMode,
    shouldFocusError,
    shouldUnregister,
    shouldUseNativeValidation,
    delayError,
    ...formProps
  }: FormProps<T>,
  ref: React.Ref<UseFormReturn<T>>
) {
  const methods = useForm<T>({
    defaultValues,
    resolver: validationSchema,
    mode,
    criteriaMode,
    shouldFocusError,
    shouldUnregister,
    shouldUseNativeValidation,
    delayError,
  });

  useImperativeHandle(ref, () => methods, [methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...formProps}>
        {children}
      </form>
    </FormProvider>
  );
}

FormComponent.displayName = "Form";

export const Form = forwardRef(FormComponent) as <T extends FieldValues>(
  props: FormProps<T> & { ref?: React.Ref<UseFormReturn<T>> }
) => ReturnType<typeof FormComponent>;
