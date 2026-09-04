import 'server-only'

import { eq, sql } from 'drizzle-orm'
import { DateTime, Effect } from 'effect'

import { db } from '~/db/client'
import { accountProfiles, passkeys, users } from '~/db/schema'
import { updateAccountProfileForAccountScreenInputSchema } from '~/domains/account/contracts/update-account-profile-for-account-screen'
import {
  AccountProfileNotFoundError,
  AccountProfileReadError,
  AccountProfileUpdateError,
} from '~/domains/account/server/errors'
import type { z } from 'zod'

type AccountProfileUpdate = z.infer<
  typeof updateAccountProfileForAccountScreenInputSchema
> & { readonly accountId: string }

export const getAccountProfileForAccountScreenFromDatabase = (accountId: string) =>
  Effect.tryPromise({
    try: () =>
      db
        .select({
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          bio: accountProfiles.bio,
          hasPasskey: sql<boolean>`exists (select 1 from ${passkeys} where ${passkeys.userId} = ${users.id})`,
        })
        .from(users)
        .leftJoin(accountProfiles, eq(accountProfiles.accountId, users.id))
        .where(eq(users.id, accountId)),
    catch: (cause) => new AccountProfileReadError({ cause }),
  }).pipe(
    Effect.flatMap(([profile]) =>
      profile === undefined
        ? Effect.fail(new AccountProfileNotFoundError())
        : Effect.succeed({ ...profile, bio: profile.bio ?? '' }),
    ),
  )

export const updateAccountProfileForAccountScreenInDatabase = (
  input: AccountProfileUpdate,
) =>
  DateTime.nowAsDate.pipe(
    Effect.flatMap((now) =>
      Effect.tryPromise({
        try: () =>
          db.transaction((transaction) =>
            transaction
              .update(users)
              .set({ name: input.name, updatedAt: now })
              .where(eq(users.id, input.accountId))
              .then(() =>
                transaction
                  .insert(accountProfiles)
                  .values({
                    accountId: input.accountId,
                    bio: input.bio,
                    updatedAt: now,
                  })
                  .onConflictDoUpdate({
                    target: accountProfiles.accountId,
                    set: { bio: input.bio, updatedAt: now },
                  }),
              ),
          ),
        catch: (cause) => new AccountProfileUpdateError({ cause }),
      }),
    ),
    Effect.as({ name: input.name, bio: input.bio }),
  )
