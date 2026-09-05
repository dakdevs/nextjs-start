'use client'

import {
  Box,
  Button,
  Flex,
  Grid,
  Link as ChakraLink,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  ActivityIcon,
  DatabaseIcon,
  HouseIcon,
  KeyRoundIcon,
  UsersIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { authClient } from '~/auth/client'

const adminNavigation = [
  { href: '/admin', icon: HouseIcon, label: 'Workflows' },
  { href: '/admin/users', icon: UsersIcon, label: 'People' },
  { href: '/admin/data', icon: DatabaseIcon, label: 'Data' },
  {
    href: '/admin/service-accounts',
    icon: KeyRoundIcon,
    label: 'Service accounts',
  },
  { href: '/admin/activity', icon: ActivityIcon, label: 'Activity' },
] as const

function AdminNavigation() {
  const pathname = usePathname()

  return (
    <Flex
      as="nav"
      aria-label="Admin navigation"
      direction={{ base: 'row', lg: 'column' }}
      gap="1"
      overflowX={{ base: 'auto', lg: 'visible' }}
      py={{ base: '3', lg: '0' }}
    >
      {adminNavigation.map(({ href, icon: Icon, label }) => {
        const isCurrent =
          href === '/admin' ? pathname === href : pathname.startsWith(href)

        return (
          <ChakraLink
            key={href}
            asChild
            unstyled
          >
            <Link
              href={href}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <Flex
                align="center"
                bg={isCurrent ? 'var(--accent)' : 'transparent'}
                borderRadius="lg"
                color={isCurrent ? 'var(--foreground)' : 'var(--muted-foreground)'}
                flexShrink="0"
                gap="3"
                minH="44px"
                px="3"
                transition="background-color 150ms ease-out, color 150ms ease-out"
                _hover={{ bg: 'var(--muted)', color: 'var(--foreground)' }}
                _focusVisible={{
                  outline: '3px solid var(--ring)',
                  outlineOffset: '2px',
                }}
              >
                <Icon aria-hidden="true" />
                <Text
                  className="text-ui"
                  fontWeight="medium"
                >
                  {label}
                </Text>
              </Flex>
            </Link>
          </ChakraLink>
        )
      })}
    </Flex>
  )
}

function AdminSignOutButton() {
  const router = useRouter()

  return (
    <Button
      bg="var(--muted)"
      color="var(--foreground)"
      mt="4"
      minH="44px"
      variant="subtle"
      onClick={() => {
        void authClient.signOut().then(() => {
          router.replace('/sign-in')
        })
      }}
      _hover={{ bg: 'var(--accent)' }}
    >
      Sign out
    </Button>
  )
}

export function AdminShell({
  children,
  user,
}: {
  readonly children: ReactNode
  readonly user: { readonly email: string; readonly name: string }
}) {
  return (
    <Grid
      className="admin-chakra-scope"
      minH="100dvh"
      bg="var(--background)"
      color="var(--foreground)"
      fontFamily="var(--font-geist)"
      gridTemplateColumns={{ base: 'minmax(0, 1fr)', lg: '15.5rem minmax(0, 1fr)' }}
    >
      <ChakraLink
        href="#admin-content"
        position="fixed"
        left="3"
        top="3"
        zIndex="skipLink"
        bg="var(--foreground)"
        color="var(--background)"
        borderRadius="lg"
        px="4"
        py="3"
        transform="translateY(-150%)"
        _focusVisible={{ transform: 'translateY(0)' }}
      >
        Skip to admin content
      </ChakraLink>

      <Box
        as="aside"
        bg="var(--card)"
        display={{ base: 'none', lg: 'block' }}
        minH="100dvh"
        px="4"
        py="6"
      >
        <VStack
          align="stretch"
          gap="8"
          position="sticky"
          top="6"
        >
          <Box px="3">
            <Text
              className="text-ui"
              fontWeight="semibold"
              letterSpacing="tight"
            >
              nextjs-start
            </Text>
            <Text
              className="text-ui"
              color="var(--muted-foreground)"
              mt="1"
            >
              Admin
            </Text>
          </Box>
          <AdminNavigation />
          <Box
            mt="auto"
            px="3"
            pt="6"
          >
            <Text
              className="text-ui"
              fontWeight="medium"
              truncate
            >
              {user.name}
            </Text>
            <Text
              className="text-ui"
              color="var(--muted-foreground)"
              truncate
            >
              {user.email}
            </Text>
            <AdminSignOutButton />
          </Box>
        </VStack>
      </Box>

      <Box minW="0">
        <Box
          as="header"
          bg="var(--card)"
          display={{ base: 'block', lg: 'none' }}
          px={{ base: '4', sm: '6' }}
          pt="4"
        >
          <Flex
            align="center"
            justify="space-between"
            gap="4"
          >
            <Box>
              <Text
                className="text-ui"
                fontWeight="semibold"
              >
                nextjs-start
              </Text>
              <Text
                className="text-ui"
                color="var(--muted-foreground)"
              >
                Admin
              </Text>
            </Box>
            <AdminSignOutButton />
          </Flex>
          <AdminNavigation />
        </Box>
        <Box
          id="admin-content"
          as="main"
          minW="0"
        >
          {children}
        </Box>
      </Box>
    </Grid>
  )
}
