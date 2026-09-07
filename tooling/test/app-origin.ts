import { z } from 'zod'

export const testAppPort = z.coerce
  .number()
  .int()
  .min(1024)
  .max(65535)
  .parse(process.env.TEST_APP_PORT ?? 3100)

export const testAppOrigin = `http://localhost:${testAppPort}`
