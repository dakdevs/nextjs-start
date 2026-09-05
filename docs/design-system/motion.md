# Motion and interaction language

Motion is purposeful feedback and spatial explanation, never ambient filler.
The product should feel calm, responsive, and physically coherent; a user must
be able to complete every task just as well when motion is reduced or absent.
Use the vocabulary below consistently in feature/design discussions.

## Decide before implementing

| Situation                                                    | Direction                                                                                    |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Seen more than roughly 100 times a day or keyboard-only work | Usually no animation; fast response is the polish.                                           |
| User-initiated entry or exit                                 | `ease-out`, normally 150–250ms.                                                              |
| Object moves or morphs while already on screen               | `ease-in-out`; use a spring only when interruption/momentum communicates state.              |
| Hover, color, or opacity feedback                            | `ease`, brief, and only on hover-capable devices.                                            |
| Press                                                        | `scale(0.97)` or equivalent restrained feedback; never delay the action.                     |
| Modal, menu, toast, or conditional UI removal                | Use an exit as well as an entry; Motion `AnimatePresence` when it earns its cost.            |
| Shared object across views                                   | Consider a shared element transition / `layoutId`; keep navigation fast and test under load. |
| One shape/state becomes another                              | Call it a **morph**; use Morphicons only when semantic icon continuity helps.                |

Avoid `ease-in` for normal UI, `scale(0)`, surprise bounce, layered parent-plus-
child entrances, carousel-like movement without user intent, and `transition: all`.
Product motion should generally finish under 300ms; a page transition may reach
400ms only when it clarifies navigation.

## Vocabulary

Name the observed effect before choosing a mechanism: **pop in** (near-full
scale plus opacity), **crossfade** (brief overlapping dissolve), **stagger**
(intentional cascade), **origin-aware animation** (from its trigger), **shared
element transition** (the same object travels across states), **layout
animation**, **morph**, and **press feedback**. Use terms precisely in feature
docs and implementation prompts so motion is intentional and reviewable.

## Implementation rules

- Put `MotionConfig reducedMotion="user"` at the app boundary. For a component
  where a fade-only fallback loses meaning, use `useReducedMotion` and define
  two explicit variants.
- Under reduced motion remove transform, layout, scale, and travel; keep useful
  opacity/color state changes. Disable decorative/autoplay loops and smooth
  scrolling. Test the reduced variant in browser emulation.
- Prefer `transform` and `opacity`. Do not animate layout properties, font
  weight, large blur, box shadow, or inherited CSS variables by default.
- Use CSS/WAAPI for simple effects and motion that coincides with navigation or
  heavy loading. Use `motion/react` for real springs, gestures, shared layout,
  and exit orchestration. Never drive frame-by-frame animation through React
  state.
- Add `will-change` only after profiling a real shift/jank problem, and only to
  the small affected element. Validate on a mid-range touch device as well as
  desktop.
- Keep 44px touch targets, visible focus, semantic controls, and keyboard paths.
  Gate hover effects with `@media (hover: hover)`; hover cannot carry required
  information. Icon-only controls require an accessible name.
- Every input, select, and textarea renders at least 16px at every breakpoint.
  Treat mobile as first-class: it may need larger controls, and verify both
  mobile and desktop happy paths for ergonomics, not only visual fit.
- Reserve layout before dynamic values load. Use tabular figures for changing
  numbers and do not change font weight on hover/selection.

## Review questions

1. Does this motion explain feedback, hierarchy, or spatial continuity?
2. Is it fast, interruptible where necessary, and free of layout shift?
3. Does the reduced-motion version retain meaning without travel?
4. Are properties composite-friendly, and is the page likely busy while it runs?
5. Do desktop and mobile keyboard/touch paths work without hover or animation?

## Links

[Design system](README.md) · [UI library selection](../reference/ui-library-selection.md) · [Evolution workflow](evolution.md) · [Feature workflow](../guides/feature-workflow.md)
