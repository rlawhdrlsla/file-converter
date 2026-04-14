import { useEffect, useRef } from 'react'

export default function AdBanner({ slot = 'top', className = '' }) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2550387699417589"
        data-ad-slot="4902846659"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
