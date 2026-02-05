import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["viewport", "track"]
  static values = {
    speed: { type: Number, default: 0.45 },
    mobileSpeed: { type: Number, default: 0.30 },
    gap: { type: Number, default: 18 },
    fps: { type: Number, default: 60 },
    mobileFps: { type: Number, default: 30 }
  }

  connect() {
    this._raf = null
    this._offset = 0
    this._loopWidth = 0
    this._running = false
    this._lastTs = 0

    this._reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    this._isMobile = window.matchMedia("(max-width: 639px)").matches

    this.trackTarget.style.setProperty("--cases-gap", `${this.gapValue}px`)

    // Observa visibilidade pra só animar quando estiver na viewport
    this._io = new IntersectionObserver(
      (entries) => {
        const visible = !!entries[0]?.isIntersecting
        if (visible) this._start()
        else this._stop()
      },
      { threshold: 0.12 }
    )
    this._io.observe(this.element)

    // Pausa quando aba perde foco
    this._onVis = () => {
      if (document.visibilityState === "hidden") this._stop()
      else this._start()
    }
    document.addEventListener("visibilitychange", this._onVis, { passive: true })

    // ResizeObserver é melhor que window.resize
    this._ro = null
    if ("ResizeObserver" in window) {
      this._ro = new ResizeObserver(() => this._setup())
      this._ro.observe(this.viewportTarget)
    } else {
      this._onResize = () => this._setup()
      window.addEventListener("resize", this._onResize, { passive: true })
    }

    this._setup()

    // reduced-motion: não anima
    if (this._reduce) {
      this._stop()
      this.trackTarget.style.transform = "translate3d(0,0,0)"
      return
    }
  }

  disconnect() {
    this._stop()
    if (this._io) this._io.disconnect()
    if (this._ro) this._ro.disconnect()
    if (this._onResize) window.removeEventListener("resize", this._onResize)
    document.removeEventListener("visibilitychange", this._onVis)
  }

  _setup() {
    this._removeClones()

    const viewportW = this.viewportTarget?.clientWidth || 0
    if (!viewportW) return

    const originals = Array.from(this.trackTarget.children)
    const baseWidth = this._measureWidth(originals)
    if (baseWidth <= 0) return

    // Menos clones: suficiente pra loop suave (mais leve que 3.0x)
    const needWidth = viewportW * 2.2
    const copies = Math.ceil(needWidth / baseWidth) + 1

    for (let i = 0; i < copies; i++) {
      originals.forEach((node) => {
        const clone = node.cloneNode(true)
        clone.dataset.clone = "true"
        const img = clone.querySelector("img")
        if (img) img.alt = ""
        this.trackTarget.appendChild(clone)
      })
    }

    this._loopWidth = baseWidth
    // normaliza offset pro loop atual
    this._offset = ((this._offset % this._loopWidth) + this._loopWidth) % this._loopWidth
    this._applyTransform()
  }

  _measureWidth(nodes) {
    const gap = this.gapValue
    let total = 0
    nodes.forEach((n, idx) => {
      total += n.getBoundingClientRect().width
      if (idx < nodes.length - 1) total += gap
    })
    return total
  }

  _removeClones() {
    this.trackTarget.querySelectorAll("[data-clone='true']").forEach((el) => el.remove())
  }

  _start() {
    if (this._running) return
    if (this._reduce) return
    if (!this._loopWidth) return
    if (document.visibilityState === "hidden") return

    this._running = true
    this._lastTs = 0

    const fps = this._isMobile ? this.mobileFpsValue : this.fpsValue
    const frameMs = 1000 / Math.max(10, fps)
    const pxPerFrame = this._isMobile ? this.mobileSpeedValue : this.speedValue

    const tick = (ts) => {
      if (!this._running) return

      if (!this._lastTs) this._lastTs = ts
      const dt = ts - this._lastTs

      // limita FPS
      if (dt >= frameMs) {
        // mantém ritmo mesmo com dt maior (scroll/lag)
        const steps = Math.max(1, Math.round(dt / frameMs))
        this._offset = (this._offset + pxPerFrame * steps) % this._loopWidth
        this._applyTransform()
        this._lastTs = ts
      }

      this._raf = requestAnimationFrame(tick)
    }

    this._raf = requestAnimationFrame(tick)
  }

  _stop() {
    this._running = false
    if (!this._raf) return
    cancelAnimationFrame(this._raf)
    this._raf = null
  }

  _applyTransform() {
    this.trackTarget.style.transform = `translate3d(${-this._offset}px, 0, 0)`
  }
}
