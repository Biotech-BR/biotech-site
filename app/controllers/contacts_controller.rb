# frozen_string_literal: true

class ContactsController < ApplicationController
  def create
    @form = ContactForm.new(contact_params)

    if @form.valid?
      ContactMailer.new_contact(contact_payload).deliver_later
      ContactMailer.auto_reply(contact_payload).deliver_later

      redirect_to "/contato", notice: "Recebemos sua mensagem. Vamos te responder em breve."
    else
      flash.now[:alert] = "Confira os campos e tente novamente."
      render "pages/contact", status: :unprocessable_entity
    end
  end

  private

  def contact_params
    params
      .require(:contact_form)
      .permit(:name, :email, :phone, :company, :subject, :message, :website)
  end

  def contact_payload
    p = contact_params.to_h
    p.delete("website")
    p["name"]    = p["name"].to_s.strip
    p["email"]   = p["email"].to_s.strip.downcase
    p["subject"] = p["subject"].to_s.strip
    p["phone"]   = p["phone"].to_s.strip
    p["company"] = p["company"].to_s.strip
    p["message"] = p["message"].to_s.strip

    p
  end
end
