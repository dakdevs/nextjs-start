'use client'

import { CheckIcon, MoonIcon, SunIcon } from 'lucide-react'
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
  const Icon = resolvedTheme === 'dark' ? MoonIcon : SunIcon

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
        <Icon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-36 bg-popover shadow-none ring-1 ring-foreground/10"
      >
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={setTheme}
        >
          {themeOptions.map((option) => (
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
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
