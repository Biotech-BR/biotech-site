import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel", "iconOpen", "iconClose"]

  connect() {
    this.open = false
    this._apply()
    this._onKeydown = (e) => {
      if (e.key === "Escape") this.close()
    }
  }

  disconnect() {
    document.removeEventListener("keydown", this._onKeydown)
    document.body.classList.remove("overflow-hidden")
  }

  toggle() {
    this.open = !this.open
    this._apply()
  }

  close() {
    this.open = false
    this._apply()
  }

  closeOnBackdrop(event) {
    if (event.target === event.currentTarget) this.close()
  }

  _apply() {
    if (!this.hasPanelTarget) return

    this.panelTarget.classList.toggle("hidden", !this.open)

    if (this.hasIconOpenTarget) this.iconOpenTarget.classList.toggle("hidden", this.open)
    if (this.hasIconCloseTarget) this.iconCloseTarget.classList.toggle("hidden", !this.open)

    const btn = this.element.querySelector("[data-role='menu-button']")
    if (btn) btn.setAttribute("aria-expanded", this.open ? "true" : "false")

    document.body.classList.toggle("overflow-hidden", this.open)

    if (this.open) document.addEventListener("keydown", this._onKeydown)
    else document.removeEventListener("keydown", this._onKeydown)
  }
}
