import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["viewport", "track"]
  static values = {
    speed: { type: Number, default: 0.45 }, 
    gap: { type: Number, default: 18 }     
  }

  connect() {
    this._raf = null
    this._offset = 0
    this._loopWidth = 0

    this.trackTarget.style.setProperty("--cases-gap", `${this.gapValue}px`)

    this._setup()
    this._start()

    this._onResize = () => this._setup()
    window.addEventListener("resize", this._onResize, { passive: true })
  }

  disconnect() {
    this._stop()
    window.removeEventListener("resize", this._onResize)
  }

  _setup() {
    this._removeClones()

    const viewportW = this.viewportTarget.clientWidth
    if (!viewportW) return

    const originals = Array.from(this.trackTarget.children)
    const baseWidth = this._measureWidth(originals)
    if (baseWidth <= 0) return

    const needWidth = viewportW * 3.0
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
    if (this._raf) return
    const tick = () => {
      if (this._loopWidth) {
        this._offset = (this._offset + this.speedValue) % this._loopWidth
        this._applyTransform()
      }
      this._raf = requestAnimationFrame(tick)
    }
    this._raf = requestAnimationFrame(tick)
  }

  _stop() {
    if (!this._raf) return
    cancelAnimationFrame(this._raf)
    this._raf = null
  }

  _applyTransform() {
    this.trackTarget.style.transform = `translate3d(${-this._offset}px, 0, 0)`
  }
}
