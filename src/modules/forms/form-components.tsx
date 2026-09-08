'use client'

import type { ComponentProps } from 'react'
import { z } from 'zod'

import { Button } from '~/components/shadcn/button'
import { useFormContext } from './contexts'
import { validationMessages } from './validation-messages'
import { ReportedSubmissionError } from './reported-submission-error'

export function Form({
  children,
  ...props
}: Omit<
  ComponentProps<'form'>,
  'action' | 'onSubmit' | 'onReset' | 'method' | 'noValidate'
>) {
  const form = useFormContext()

  return (
    <form
      {...props}
      method="post"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()

        event.stopPropagation()

        if (form.state.isSubmitting) {
          return
        }

        const element = event.currentTarget

        void form
          .handleSubmit()
          .then(() => {
            if (!form.state.isValid) {
              element.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
            }
          })
          .catch((cause: unknown) => {
            if (z.instanceof(ReportedSubmissionError).safeParse(cause).success) {
              return
            }

            const parsedCause = z.instanceof(Error).safeParse(cause)

            const errorId = crypto.randomUUID()

            console.error(
              JSON.stringify({
                event: 'error.form-submit',
                errorId,
                causeName: parsedCause.success
                  ? parsedCause.data.name
                  : 'UnknownFailure',
              }),
            )

            form.setErrorMap({ onSubmit: `Something went wrong. Error ID: ${errorId}` })
          })
      }}
      onReset={(event) => {
        event.preventDefault()

        if (!form.state.isSubmitting) {
          form.reset()
        }
      }}
    >
      {children}
    </form>
  )
}

export function ResetButton({
  children = 'Reset',
  disabled,
  ...props
}: Omit<ComponentProps<typeof Button>, 'type'>) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => {
        return state.isSubmitting
      }}
    >
      {(isSubmitting) => {
        return (
          <Button
            {...props}
            type="reset"
            variant="secondary"
            disabled={disabled === true || isSubmitting}
          >
            {children}
          </Button>
        )
      }}
    </form.Subscribe>
  )
}

export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: Omit<ComponentProps<typeof Button>, 'type'> & { pendingLabel: string }) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => {
        return [state.isSubmitting, state.canSubmit] as const
      }}
    >
      {([isSubmitting, canSubmit]) => {
        return (
          <Button
            {...props}
            type="submit"
            disabled={disabled === true || isSubmitting || !canSubmit}
          >
            {isSubmitting ? pendingLabel : children}
          </Button>
        )
      }}
    </form.Subscribe>
  )
}

export function Feedback({ message }: { message?: string | null }) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => {
        return validationMessages(state.errors).join(' ')
      }}
    >
      {(feedback) => {
        return (
          <div
            aria-live="polite"
            className="text-ui text-muted-foreground"
          >
            {feedback || message}
          </div>
        )
      }}
    </form.Subscribe>
  )
}
