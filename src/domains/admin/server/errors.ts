import { Data } from 'effect'

export const AdminReadError = Data.TaggedError('AdminReadError')<{
  readonly cause: unknown
}>

export const AdminWriteError = Data.TaggedError('AdminWriteError')<{
  readonly cause: unknown
}>

export const AdminPasswordResetError = Data.TaggedError('AdminPasswordResetError')<{
  readonly cause: unknown
}>
