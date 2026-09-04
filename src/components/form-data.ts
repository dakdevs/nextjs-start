import { z } from 'zod'

export function getFormText(formData: FormData, key: string) {
  return z.string().catch('').parse(formData.get(key))
}
