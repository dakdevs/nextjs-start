'use client'

import { Box, Button, Heading, Text } from '@chakra-ui/react'

import { useClientBoundaryError } from '~/observability/use-client-boundary-error'

export default function AdminError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string }
  readonly reset: () => void
}) {
  const errorId = useClientBoundaryError(error)

  return (
    <Box
      maxW="48rem"
      mx="auto"
      px={{ base: '4', sm: '6', lg: '10' }}
      py="16"
    >
      <Box
        bg="var(--card)"
        borderRadius="2xl"
        p={{ base: '6', sm: '8' }}
      >
        <Text
          className="text-ui"
          color="var(--muted-foreground)"
          fontWeight="medium"
        >
          Admin
        </Text>
        <Heading
          as="h1"
          className="text-title"
          mt="3"
        >
          Something went wrong
        </Heading>
        <Text
          color="var(--muted-foreground)"
          lineHeight="tall"
          mt="4"
        >
          Try again. If the problem continues, share this error ID with support.
        </Text>
        <Text
          as="code"
          className="text-ui"
          color="var(--muted-foreground)"
          display="block"
          mt="3"
        >
          Error ID: {errorId}
        </Text>
        <Button
          bg="var(--foreground)"
          color="var(--background)"
          minH="44px"
          mt="6"
          onClick={reset}
          _hover={{ opacity: 0.88 }}
        >
          Try again
        </Button>
      </Box>
    </Box>
  )
}
