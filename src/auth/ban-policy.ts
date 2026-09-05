type BanDetails = {
  readonly banned: boolean
  readonly banExpires: Date | null
}

/** A permanent ban has no expiry; a temporary ban ends at its recorded time. */
export const isUserBanActive = (ban: BanDetails, now: Date) =>
  ban.banned && (ban.banExpires === null || ban.banExpires.getTime() > now.getTime())
