import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["tab", "panel", "underline"]
  static values = { active: String }

  connect() {
    if (!this.hasActiveValue) this.activeValue = "code"

    this.tabTargets.forEach((t) => {
      t.setAttribute("role", "tab")
      t.setAttribute("tabindex", "-1")
      t.addEventListener("keydown", this.onKeydown)
    })

    requestAnimationFrame(() => {
      this.apply()
      this.positionUnderline()
      this.setFocusable()
    })

    window.addEventListener("resize", this.onResize, { passive: true })
  }

  disconnect() {
    window.removeEventListener("resize", this.onResize)
    this.tabTargets.forEach((t) => t.removeEventListener("keydown", this.onKeydown))
  }

  onResize = () => {
    this.positionUnderline()
  }

  onKeydown = (e) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "]
    if (!keys.includes(e.key)) return

    const tabs = this.tabTargets
    const currentIndex = tabs.indexOf(e.currentTarget)
    let nextIndex = currentIndex

    if (e.key === "ArrowLeft") nextIndex = Math.max(0, currentIndex - 1)
    if (e.key === "ArrowRight") nextIndex = Math.min(tabs.length - 1, currentIndex + 1)
    if (e.key === "Home") nextIndex = 0
    if (e.key === "End") nextIndex = tabs.length - 1

    if (["Enter", " "].includes(e.key)) {
      e.preventDefault()
      this.select({ currentTarget: e.currentTarget })
      return
    }

    e.preventDefault()
    tabs[nextIndex].focus()
  }

  select(event) {
    const value = event.currentTarget.dataset.value
    this.activeValue = value

    this.apply()
    this.positionUnderline()
    this.setFocusable()
  }

  apply() {
    this.tabTargets.forEach((btn) => {
      const isActive = btn.dataset.value === this.activeValue
      btn.classList.toggle("is-active", isActive)
      btn.setAttribute("aria-selected", isActive ? "true" : "false")
    })

    this.panelTargets.forEach((el) => {
      const show = el.dataset.key === this.activeValue
      el.classList.toggle("hidden", !show)
    })
  }

  setFocusable() {
    this.tabTargets.forEach((btn) => {
      const isActive = btn.dataset.value === this.activeValue
      btn.setAttribute("tabindex", isActive ? "0" : "-1")
    })
  }

  positionUnderline() {
    if (!this.hasUnderlineTarget) return

    const active = this.tabTargets.find((t) => t.dataset.value === this.activeValue)
    if (!active) return

    const parent = active.parentElement
    const left = active.offsetLeft
    const width = active.offsetWidth
    const underlineWidth = Math.max(46, Math.floor(width * 0.62))
    const centeredLeft = left + Math.floor((width - underlineWidth) / 2)

    this.underlineTarget.style.width = `${underlineWidth}px`
    this.underlineTarget.style.transform = `translateX(${centeredLeft}px)`
  }
}
