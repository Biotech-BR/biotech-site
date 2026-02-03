# frozen_string_literal: true

class ContactMailer < ApplicationMailer
  def new_contact(payload)
    @form = ContactForm.new(payload)

    mail(
      to: "atendimento@biotechapplications.com.br",
      reply_to: @form.email,
      subject: "[Site] #{@form.safe_subject}"
    )
  end

  def auto_reply(payload)
    @form = ContactForm.new(payload)

    mail(
      to: @form.email,
      subject: "Recebemos sua mensagem ✅"
    )
  end
end
