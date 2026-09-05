import { Box, Heading, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export function AdminPage({ children }: { readonly children: ReactNode }) {
  return (
    <Box
      maxW="80rem"
      mx="auto"
      px={{ base: '4', sm: '6', lg: '10' }}
      py={{ base: '8', sm: '10', lg: '14' }}
    >
      {children}
    </Box>
  )
}

export function AdminPageHeader({
  description,
  eyebrow = 'Admin',
  title,
}: {
  readonly description: string
  readonly eyebrow?: string
  readonly title: string
}) {
  return (
    <Box
      as="header"
      maxW="44rem"
    >
      <Text
        className="text-ui"
        color="var(--muted-foreground)"
        fontWeight="medium"
      >
        {eyebrow}
      </Text>
      <Heading
        as="h1"
        className="text-title"
        letterSpacing="tight"
        mt="3"
      >
        {title}
      </Heading>
      <Text
        color="var(--muted-foreground)"
        lineHeight="tall"
        mt="3"
      >
        {description}
      </Text>
    </Box>
  )
}

export function AdminSectionHeading({
  children,
  description,
}: {
  readonly children: ReactNode
  readonly description?: string
}) {
  return (
    <Box>
      <Heading
        as="h2"
        className="text-body"
        fontWeight="semibold"
      >
        {children}
      </Heading>
      {description === undefined ? null : (
        <Text
          className="text-ui"
          color="var(--muted-foreground)"
          mt="1"
        >
          {description}
        </Text>
      )}
    </Box>
  )
}
