import createGlobe from 'cobe'
import { useEffect, useRef } from 'react'
import './Globe.scss'

function hexToRgb01(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ]
}

function getGlobeColors() {
  const s = getComputedStyle(document.body)
  const isLight = document.body.classList.contains('light')
  const accent = s.getPropertyValue('--accent').trim() || '#e8e4df'
  const accentSecondary = s.getPropertyValue('--accent-secondary').trim() || '#7dd3fc'
  const accentTertiary = s.getPropertyValue('--accent-tertiary').trim() || '#c4b5fd'
  return {
    dark: isLight ? 1 : 0,
    baseColor: isLight ? [0.85, 0.83, 0.81] : [0.17, 0.17, 0.17],
    markerColor: hexToRgb01(accentSecondary),
    glowColor: hexToRgb01(accent),
  }
}

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

  const createGlobeInstance = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const size = Math.max(Math.floor(rect.width), 200)
    const dpr = Math.min(window.devicePixelRatio, 2)

    if (globeRef.current) {
      globeRef.current.destroy()
      globeRef.current = null
    }
    canvas.classList.remove('is-ready')

    const colors = getGlobeColors()
    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: phiRef.current,
      theta: 0.3,
      dark: colors.dark,
      diffuse: 1.2,
      scale: 1,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: colors.baseColor,
      markerColor: colors.markerColor,
      glowColor: colors.glowColor,
      offset: [0, 0],
    })

    canvas.classList.add('is-ready')
  }

  useEffect(() => {
    createGlobeInstance()

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

    const observer = new MutationObserver(() => {
      createGlobeInstance()
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observer.disconnect()
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
