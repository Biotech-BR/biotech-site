import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["step", "root"]
  static values = {
    stagger: { type: Number, default: 420 },
    fall: { type: Number, default: 10 }  
  }

  connect() {
    this._played = false

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (!e?.isIntersecting) return
        if (this._played) return

        this._played = true
        this.play()
        io.disconnect()
      },
      { threshold: 0.22 }
    )

    io.observe(this.element)
    this._io = io
  }

  disconnect() {
    if (this._io) this._io.disconnect()
  }

  play() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const base = reduce ? 0 : this.staggerValue
    this.stepTargets.forEach((el, idx) => {
      const fall = Math.min(18, idx * 2 + this.fallValue)
      el.style.setProperty("--fall", `${fall}px`)

      window.setTimeout(() => {
        el.classList.add("is-visible")
      }, idx * base)
    })
  }
}
