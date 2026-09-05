'use client'

import { Box, Flex, Link as ChakraLink, Text } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRightIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'

import { DitherWorkflowBackground } from '~/components/dither-workflow-background'

export function AdminWorkflowCard({
  description,
  href,
  icon: Icon,
  metric,
  title,
}: {
  readonly description: string
  readonly href:
    | '/admin/activity'
    | '/admin/data'
    | '/admin/service-accounts'
    | '/admin/users'
  readonly icon: LucideIcon
  readonly metric?: string
  readonly title: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileTap={shouldReduceMotion === true ? {} : { scale: 0.995 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <ChakraLink
        asChild
        unstyled
      >
        <Link href={href}>
          <Box
            position="relative"
            aspectRatio="1 / 1"
            bg="var(--card)"
            borderRadius="2xl"
            minH="15rem"
            overflow="hidden"
            p={{ base: '5', sm: '6' }}
            transition="background-color 180ms ease-out, box-shadow 180ms ease-out"
            _hover={{
              bg: 'color-mix(in oklab, var(--card) 94%, var(--foreground))',
              boxShadow:
                '0 16px 40px color-mix(in oklab, var(--foreground) 8%, transparent)',
            }}
            _focusVisible={{
              outline: '3px solid var(--ring)',
              outlineOffset: '3px',
            }}
          >
            <DitherWorkflowBackground seed={title} />
            <Flex
              position="relative"
              zIndex="1"
              direction="column"
              justify="space-between"
              h="full"
              gap="8"
            >
              <Flex
                justify="space-between"
                align="start"
                gap="4"
              >
                <Flex
                  align="center"
                  justify="center"
                  bg="color-mix(in oklab, var(--background) 76%, transparent)"
                  borderRadius="xl"
                  boxSize="44px"
                >
                  <Icon aria-hidden="true" />
                </Flex>
                <ArrowUpRightIcon aria-hidden="true" />
              </Flex>
              <Box>
                {metric === undefined ? null : (
                  <Text
                    className="text-ui"
                    color="var(--muted-foreground)"
                    mb="2"
                  >
                    {metric}
                  </Text>
                )}
                <Text
                  className="text-body"
                  fontWeight="semibold"
                >
                  {title}
                </Text>
                <Text
                  className="text-ui"
                  color="var(--muted-foreground)"
                  lineHeight="tall"
                  mt="2"
                >
                  {description}
                </Text>
              </Box>
            </Flex>
          </Box>
        </Link>
      </ChakraLink>
    </motion.div>
  )
}
