
import { useEffect } from 'react'
import Lenis from 'lenis'

function SmoothScroll() {
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches

        if (prefersReducedMotion) return

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.85,
            touchMultiplier: 1.1,
            anchors: true,
            autoRaf: true,
        })

        return () => {
            lenis.destroy()
        }
    }, [])

    return null
}

export default SmoothScroll
