import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { useAppForm, withForm } from './use-app-form'
import { validationMessages } from './validation-messages'

const defaults = { name: 'Ada', bio: 'Mathematician' }
const schema = z.object({ name: z.string().min(1, 'Enter a name.'), bio: z.string() })
const options = {
  defaultValues: defaults,
  validators: { onChange: schema, onBlur: schema, onSubmit: schema },
}
const NameSection = withForm({
  ...options,
  render: function NameSection({ form }) {
    return (
      <form.AppField name="name">
        {(field) => {
          return (
            <field.TextField
              label="Name"
              autoComplete="name"
              required
            />
          )
        }}
      </form.AppField>
    )
  },
})

function Fixture({ save }: { save: (value: typeof defaults) => Promise<void> }) {
  const form = useAppForm({
    ...options,
    onSubmit: ({ value }) => {
      return save(value)
    },
  })

  return (
    <form.AppForm>
      <form.Form aria-label="Profile">
        <NameSection form={form} />
        <form.AppField name="bio">
          {(field) => {
            return (
              <field.TextareaField
                label="Bio"
                description="Public biography"
              />
            )
          }}
        </form.AppField>
        <form.SubmitButton pendingLabel="Saving">Save</form.SubmitButton>
        <form.ResetButton />
        <form.Feedback />
      </form.Form>
    </form.AppForm>
  )
}

afterEach(cleanup)

describe('shared application form', () => {
  it('binds defaults and accessible validation, then resets values and errors', async () => {
    const save = vi.fn<(value: typeof defaults) => Promise<void>>(async () => {})

    render(<Fixture save={save} />)

    const name = screen.getByRole('textbox', { name: 'Name' })

    expect(name).toHaveValue('Ada')

    expect(name).toHaveAttribute('name', 'name')

    expect(name).toHaveAttribute('autocomplete', 'name')

    expect(screen.getByRole('form')).toHaveAttribute('method', 'post')

    fireEvent.change(name, { target: { value: '' } })

    fireEvent.blur(name)

    await waitFor(() => {
      return expect(name).toHaveAttribute('aria-invalid', 'true')
    })

    expect(name).toHaveAccessibleDescription('Enter a name.')

    fireEvent.submit(screen.getByRole('form'))

    expect(save).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Bio'), { target: { value: 'discard' } })

    fireEvent.reset(screen.getByRole('form'))

    await waitFor(() => {
      return expect(name).toHaveValue('Ada')
    })

    expect(name).toHaveAttribute('aria-invalid', 'false')

    expect(screen.getByLabelText('Bio')).toHaveValue('Mathematician')

    expect(screen.queryByText('Enter a name.')).not.toBeInTheDocument()
  })

  it('awaits one submission, disables pending actions, and releases them afterward', async () => {
    const completion = Promise.withResolvers<void>()

    const save = vi.fn<(value: typeof defaults) => Promise<void>>(() => {
      return completion.promise
    })

    render(<Fixture save={save} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Grace' } })

    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { value: 'Compiler pioneer' },
    })

    fireEvent.submit(screen.getByRole('form'))

    await waitFor(() => {
      return expect(screen.getByRole('button', { name: 'Saving' })).toBeDisabled()
    })

    fireEvent.submit(screen.getByRole('form'))

    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()

    expect(save).toHaveBeenCalledExactlyOnceWith({
      name: 'Grace',
      bio: 'Compiler pioneer',
    })

    await act(async () => {
      completion.resolve()

      await completion.promise
    })

    await waitFor(() => {
      return expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    })
  })

  it('shows a safe correlation ID for an unexpected submission rejection', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const save = vi.fn<(value: typeof defaults) => Promise<void>>(() => {
      return Promise.reject(new Error('private rejected payload'))
    })

    try {
      render(<Fixture save={save} />)

      fireEvent.submit(screen.getByRole('form'))

      const feedback = await screen.findByText(/Something went wrong\. Error ID:/u)

      expect(feedback.textContent).toMatch(/Error ID: [\da-f-]{36}/u)

      expect(log).toHaveBeenCalledOnce()

      expect(JSON.stringify(log.mock.calls)).not.toContain('private rejected payload')

      fireEvent.reset(screen.getByRole('form'))

      await waitFor(() => {
        return expect(feedback).toHaveTextContent('')
      })
    } finally {
      log.mockRestore()
    }
  })

  it('normalizes validator messages without rendering arbitrary objects', () => {
    expect(
      validationMessages([
        'Required',
        { message: 'Too short' },
        'Required',
        { payload: 'private' },
      ]),
    ).toEqual(['Required', 'Too short', 'This value is invalid.'])
  })
})
