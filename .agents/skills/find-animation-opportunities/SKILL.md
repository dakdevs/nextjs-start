---
name: find-animation-opportunities
description: After UI creation or a material UI change, scout the completed surface for the few motion opportunities that improve feedback or spatial clarity. Read-only.
metadata:
  short-description: Scout purposeful motion after UI work
---

# Find animation opportunities

After creating or materially changing UI, run this scout automatically. It is
not an instruction to add animation: zero changes is a successful result. This
repository-local adaptation is derived from the animation-scoping approach in
[Animations on the Web](https://animations.dev/) and is portable with this
starter's [motion language](../../../docs/design-system/motion.md).

## Scope and authority

Inspect the finished UI, its motion vocabulary, and its usage frequency. Never
modify files, install dependencies, or treat a scout report as implementation
authority. Report candidates, then make a distinct implementation step only
when the user's UI task authorizes it. Preserve the requested product scope;
safe recommendations may be applied, but do not add a destructive hold gesture,
celebration, or other interaction without a concrete need.

Once that distinct step is in scope, apply accepted low-risk recommendations
without a second interrogation; ask only when a motion choice changes product
behavior or the design language.

## Scout process

1. Read the route/module, [motion language](../../../docs/design-system/motion.md),
   and existing token/primitive values. Identify product versus marketing use
   and how often each interaction occurs.
2. Consider only meaningful changes: missing press feedback, user-triggered
   entry/exit, origin-aware overlays, a deliberate state swap, jarring height
   changes, or an explanatory marketing transition.
3. Pass every candidate through all four gates. Reject it when any gate fails:

| Gate      | Required answer                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| Frequency | It is not repeatedly encountered enough that motion adds friction.                                                         |
| Purpose   | It provides feedback, spatial continuity, state indication, prevents a jarring change, or rarely-used explanation/delight. |
| Speed     | It uses the current system's duration/easing; routine product motion finishes under 300ms.                                 |
| Function  | It helps the user complete or understand the task, rather than decorating it.                                              |

4. Report at most 5–7 opportunities for the whole application and fewer for a
   feature slice. Give each accepted candidate a `file:line`, purpose,
   frequency, current repository tokens, duration, easing, transform, and
   transform origin. Do not invent a parallel motion system, use `scale(0)`, or
   give vague "subtle transition" advice.
5. Report 2–5 rejected candidates with the gate that rejected each, then state
   the verdict and highest-leverage option. "Leave this surface static" is a
   complete verdict.

## Implementing an accepted report

Keep the implementation separately reviewable. Prefer transform and opacity;
avoid `transition: all`, layout-property animation, unprofiled `will-change`,
and React-state frame loops. Use the existing CSS/WAAPI or `motion/react`
choice only when it fits the needed behavior. Verify reduced motion, keyboard,
touch, focus, visual stability, and desktop/mobile performance. Re-scout after
a material visual change; do not assume a prior recommendation still fits.
