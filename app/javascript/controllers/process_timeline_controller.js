import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["step", "root"]
  static values = {
    stagger: { type: Number, default: 420 },
    fall: { type: Number, default: 10 }
  }

  connect() {
    this._played = false
    this._timers = []

    this._reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    this._isMobile = window.matchMedia("(max-width: 1023px)").matches // < lg

    // Um único IO na seção inteira (bem leve) e decide o modo
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e?.isIntersecting) return
        if (this._played) return

        this._played = true

        if (this._isMobile || this._reduce) {
          // Mobile: bonito e leve -> revela tudo ao mesmo tempo (sem cascata de timeouts)
          this.revealAll()
        } else {
          // Desktop: mantém stagger
          this.play()
        }

        io.disconnect()
      },
      { threshold: 0.18 }
    )

    io.observe(this.element)
    this._io = io
  }

  disconnect() {
    if (this._io) this._io.disconnect()
    if (this._timers?.length) this._timers.forEach((t) => clearTimeout(t))
  }

  revealAll() {
    this.stepTargets.forEach((el) => {
      el.style.setProperty("--fall", `0px`)
      el.classList.add("is-visible")
    })
  }

  play() {
    const base = this.staggerValue

    this.stepTargets.forEach((el, idx) => {
      const fall = Math.min(18, idx * 2 + this.fallValue)
      el.style.setProperty("--fall", `${fall}px`)

      const t = window.setTimeout(() => {
        el.classList.add("is-visible")
      }, idx * base)

      this._timers.push(t)
    })
  }
}
