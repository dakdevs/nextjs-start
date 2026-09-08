'use client'

import { Moon, Sun } from 'lucide'
import { CheckIcon } from 'lucide-react'
import { MorphIcon } from 'morphicons/react'
import { useTheme } from 'next-themes'

import { Button } from '~/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/shadcn/dropdown-menu'

const themeOptions = ['light', 'dark', 'system'] as const

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()

  const icon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Choose color theme"
          />
        }
      >
        <MorphIcon
          icon={icon}
          reducedMotion="user"
          spring="snappy"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 bg-popover shadow-none ring-1 ring-foreground/10"
      >
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={setTheme}
        >
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          {themeOptions.map((option) => {
            return (
              <DropdownMenuRadioItem
                key={option}
                value={option}
              >
                <span className="capitalize">{option}</span>
                {theme === option ? (
                  <CheckIcon
                    className="ml-auto"
                    aria-hidden="true"
                  />
                ) : null}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
