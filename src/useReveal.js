import { useEffect, useState } from 'react'

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setReducedMotion(media.matches)

    handleChange()
    media.addEventListener('change', handleChange)

    return () => media.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

export function useRevealObserver() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('[data-reveal]').forEach((element) => {
        element.classList.add('is-visible')
      })
      return undefined
    }

    const elements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px',
      },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [reducedMotion])

  return reducedMotion
}
