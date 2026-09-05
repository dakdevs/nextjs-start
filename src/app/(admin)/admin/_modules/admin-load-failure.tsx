import { Box, Heading, Text } from '@chakra-ui/react'

export function AdminLoadFailure({ errorId }: { readonly errorId: string }) {
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
          mt="4"
          color="var(--muted-foreground)"
        >
          Try again. If the problem continues, share this error ID with support:{' '}
          <Box
            as="code"
            color="var(--foreground)"
          >
            {errorId}
          </Box>
        </Text>
      </Box>
    </Box>
  )
}
