import { z } from 'zod'

const validatorMessage = z.union([
  z.string(),
  z.object({ message: z.string() }).transform((issue) => {
    return issue.message
  }),
])

export function validationMessages(errors: readonly unknown[]) {
  return [
    ...new Set(
      errors.map((error) => {
        const result = validatorMessage.safeParse(error)

        return result.success ? result.data : 'This value is invalid.'
      }),
    ),
  ]
}
