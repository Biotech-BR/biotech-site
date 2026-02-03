import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["phone", "message", "count", "max"]
  static values = { max: Number }

  connect() {
    const max = this.maxValue || 800
    if (this.hasMaxTarget) this.maxTarget.textContent = String(max)

    if (this.hasMessageTarget) {
      this.messageTarget.setAttribute("maxlength", String(max))
      this.updateCount()
      this.autoGrow()
      this.messageTarget.addEventListener("input", () => {
        this.updateCount()
        this.autoGrow()
      })
    }

    if (this.hasPhoneTarget) {
      this.phoneTarget.addEventListener("input", (e) => {
        e.target.value = this.maskPhone(e.target.value)
      })
      this.phoneTarget.value = this.maskPhone(this.phoneTarget.value || "")
    }
  }

  updateCount() {
    if (!this.hasCountTarget || !this.hasMessageTarget) return
    this.countTarget.textContent = String(this.messageTarget.value.length)
  }

  autoGrow() {
    if (!this.hasMessageTarget) return
    this.messageTarget.style.height = "auto"
    this.messageTarget.style.height = `${this.messageTarget.scrollHeight}px`
  }

  maskPhone(raw) {
    let v = String(raw || "").replace(/\D/g, "").slice(0, 11)
    if (v.length <= 10) {
      v = v.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, ddd, p1, p2) => {
        let out = ""
        if (ddd) out += `(${ddd}`
        if (ddd.length === 2) out += ") "
        if (p1) out += p1
        if (p2) out += `-${p2}`
        return out
      })
    } else {
      v = v.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_, ddd, p1, p2) => {
        let out = ""
        if (ddd) out += `(${ddd}`
        if (ddd.length === 2) out += ") "
        if (p1) out += p1
        if (p2) out += `-${p2}`
        return out
      })
    }

    return v
  }
}
