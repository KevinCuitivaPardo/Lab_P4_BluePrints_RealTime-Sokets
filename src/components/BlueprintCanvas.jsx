import { useEffect, useRef } from 'react'

export const CANVAS_W = 600
export const CANVAS_H = 400

export default function BlueprintCanvas({ points, onPoint }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 2
    ctx.beginPath()
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    ctx.stroke()
    ctx.fillStyle = '#1e40af'
    points.forEach((p) => ctx.fillRect(p.x - 2, p.y - 2, 4, 4))
  }, [points])

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    onPoint({
      x: Math.round(((e.clientX - rect.left) * CANVAS_W) / rect.width),
      y: Math.round(((e.clientY - rect.top) * CANVAS_H) / rect.height),
    })
  }

  return (
    <canvas
      ref={ref}
      width={CANVAS_W}
      height={CANVAS_H}
      onClick={handleClick}
      style={{ border: '1px solid #ddd', borderRadius: 12, cursor: 'crosshair', maxWidth: '100%' }}
    />
  )
}
