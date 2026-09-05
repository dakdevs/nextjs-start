'use client'

import { useEffect, useRef } from 'react'

const MAX_COLUMNS = 960
const MAX_ROWS = 600
const BAYER_4 = [
  [0.03125, 0.53125, 0.15625, 0.65625],
  [0.78125, 0.28125, 0.90625, 0.40625],
  [0.21875, 0.71875, 0.09375, 0.59375],
  [0.96875, 0.46875, 0.84375, 0.34375],
] as const

type Direction = 'up' | 'down' | 'left' | 'right'
type DitherGradientProperties = {
  readonly from: number
  readonly to: number
  readonly direction: Direction
  readonly cell: number
  readonly opacity: number
}

function progressForCell(
  direction: Direction,
  x: number,
  y: number,
  columns: number,
  rows: number,
) {
  if (direction === 'up') return 1 - (y + 0.5) / rows
  if (direction === 'down') return (y + 0.5) / rows
  if (direction === 'left') return 1 - (x + 0.5) / columns
  return (x + 0.5) / columns
}

const hueFill = (hue: number, opacity: number) =>
  `hsla(${((hue % 360) + 360) % 360}, 85%, 58%, ${opacity})`

function paintGradient(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  properties: DitherGradientProperties,
) {
  const context = canvas.getContext('2d')
  if (context === null || width <= 0 || height <= 0) return

  const columns = Math.min(
    MAX_COLUMNS,
    Math.max(4, Math.round(width / properties.cell)),
  )
  const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(height / properties.cell)))
  canvas.width = columns
  canvas.height = rows

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const density = 1 - progressForCell(properties.direction, x, y, columns, rows)
      const threshold = BAYER_4[y & 3]?.[x & 3] ?? 0
      const hue = density > threshold ? properties.from : properties.to
      context.fillStyle = hueFill(hue, properties.opacity)
      context.fillRect(x, y, 1, 1)
    }
  }
}

/**
 * Ordered two-tone dither copied from Dither Kit and narrowed to the admin
 * workflow-card contract. It paints only when its container size changes.
 */
export function DitherGradient(properties: DitherGradientProperties) {
  const wrapperReference = useRef<HTMLDivElement>(null)
  const canvasReference = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapper = wrapperReference.current
    const canvas = canvasReference.current
    if (wrapper === null || canvas === null) return () => {}

    const paint = () => {
      const box = wrapper.getBoundingClientRect()
      paintGradient(canvas, box.width, box.height, properties)
    }
    paint()
    const observer = new ResizeObserver(paint)
    observer.observe(wrapper)
    return () => {
      observer.disconnect()
    }
  }, [properties])

  return (
    <div
      ref={wrapperReference}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas
        ref={canvasReference}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
