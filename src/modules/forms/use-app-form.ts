'use client'

import { createFormHook } from '@tanstack/react-form'

import { fieldContext, formContext } from './contexts'
import { Feedback, Form, ResetButton, SubmitButton } from './form-components'
import { TextField } from './text-field'
import { TextareaField } from './textarea-field'
import { SelectField } from './select-field'

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField, SelectField },
  formComponents: { Form, SubmitButton, ResetButton, Feedback },
})
