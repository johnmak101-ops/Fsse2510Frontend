/**
 * @file react-hook-form Abstraction System
 * @module components/ui/form
 * 
 * Provides a context-based form orchestration layer using React Hook Form and Radix UI.
 * automates accessibility (aria labels, IDs) and state management for nested form fields.
 */

"use client"

import * as React from "react"
import type { ComponentPropsWithRef } from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
)

/** Individual field controller. binds React Hook Form state to the child control via context. */
const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    )
}

/** custom hook to extract current field state (errors, touched, valid) within a FormField. */
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext)
    const itemContext = React.useContext(FormItemContext)
    const { getFieldState, formState } = useFormContext()

    const fieldState = getFieldState(fieldContext.name, formState)

    if (!fieldContext) {
        throw new Error("useFormField must be used within <FormField>")
    }

    const { id } = itemContext

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    }
}

type FormItemContextValue = {
    id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
)

/** wrapper for a form segment (Label + Input + Error). Generates unique IDs for accessibility. */
const FormItem = ({ className, ref, ...props }: ComponentPropsWithRef<"div">) => {
    const id = React.useId()

    return (
        <FormItemContext.Provider value={{ id }}>
            <div ref={ref} className={cn("space-y-2", className)} {...props} />
        </FormItemContext.Provider>
    )
}
FormItem.displayName = "FormItem"

/** specialized Label that automatically tracks the current field's error state. */
const FormLabel = ({ className, ref, ...props }: ComponentPropsWithRef<typeof Label>) => {
    const { error, formItemId } = useFormField()

    return (
        <Label
            ref={ref}
            className={cn(error && "text-destructive", className)}
            htmlFor={formItemId}
            {...props}
        />
    )
}
FormLabel.displayName = "FormLabel"

/** slot wrapper that injects mandatory ARIA attributes based on field state. */
const FormControl = ({ ...props }: ComponentPropsWithRef<typeof Slot>) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

    return (
        <Slot
            id={formItemId}
            aria-describedby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    )
}
FormControl.displayName = "FormControl"

/** tertiary text explaining a field's purpose. linked via aria-describedby. */
const FormDescription = ({ className, ref, ...props }: ComponentPropsWithRef<"p">) => {
    const { formDescriptionId } = useFormField()

    return (
        <p
            ref={ref}
            id={formDescriptionId}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}
FormDescription.displayName = "FormDescription"

/** dynamically displays validation error messages. */
const FormMessage = ({ className, children, ref, ...props }: ComponentPropsWithRef<"p">) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) {
        return null
    }

    return (
        <p
            ref={ref}
            id={formMessageId}
            className={cn("text-sm font-medium text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    )
}
FormMessage.displayName = "FormMessage"

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
}
