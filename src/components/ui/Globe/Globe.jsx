import createGlobe from 'cobe'
import { useEffect, useRef } from 'react'
import './Globe.scss'

export default function Globe({ className = '', scrollProgress = 0, phiRef: externalPhiRef, paused = false }) {
  const canvasRef = useRef(null)
  const globeRef = useRef(null)
  const phiRef = useRef(0)
  const scrollRef = useRef(scrollProgress)
  const pauseRef = useRef(paused)
  const rafRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, offset: 0 })

  scrollRef.current = scrollProgress
  pauseRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const size = Math.max(Math.floor(rect.width), 200)
    const dpr = Math.min(window.devicePixelRatio, 2)

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: 0,
      theta: 0.3,
      dark: 0,           // 0 = fully lit, not dark
      diffuse: 1.2,
      scale: 1,
      mapSamples: 16000,
      mapBrightness: 6,   // bright map lines
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.49, 0.83, 0.99],  // sky blue
      glowColor: [0.91, 0.89, 0.87],    // warm cream
      offset: [0, 0],
    })

    canvas.classList.add('is-ready')

    const tick = () => {
      if (!dragRef.current.active && !pauseRef.current) {
        phiRef.current += 0.004 + scrollRef.current * 0.002
      }
      const currentPhi = phiRef.current + dragRef.current.offset
      if (externalPhiRef) externalPhiRef.current = currentPhi
      globeRef.current?.update({
        phi: currentPhi,
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      globeRef.current?.destroy()
      globeRef.current = null
    }
  }, [])

  const onPointerDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, offset: dragRef.current.offset }
    canvasRef.current?.classList.add('is-dragging')
  }

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return
    dragRef.current.offset = (e.clientX - dragRef.current.startX) * 0.005
  }

  const onPointerUp = () => {
    if (!dragRef.current.active) return
    phiRef.current += dragRef.current.offset
    dragRef.current = { active: false, startX: 0, offset: 0 }
    canvasRef.current?.classList.remove('is-dragging')
  }

  return (
    <div className={`globe ${className}`}>
      <canvas
        ref={canvasRef}
        className="globe__canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <div className="globe__glow" />
    </div>
  )
}
