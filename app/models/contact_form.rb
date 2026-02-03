# frozen_string_literal: true

class ContactForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :name, :string
  attribute :email, :string
  attribute :phone, :string
  attribute :company, :string
  attribute :subject, :string
  attribute :message, :string
  attribute :website, :string

  validates :name, presence: true, length: { maximum: 120 }
  validates :email, presence: true, length: { maximum: 180 }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :message, presence: true, length: { maximum: 800 }
  validates :phone, length: { maximum: 40 }, allow_blank: true
  validates :company, length: { maximum: 120 }, allow_blank: true
  validates :subject, length: { maximum: 140 }, allow_blank: true

  validate :honeypot_must_be_blank

  def normalized_phone
    return "" if phone.blank?
    phone.to_s.gsub(/[^\d+]/, "")
  end

  def safe_subject
    s = subject.to_s.strip
    s = "Contato pelo site" if s.blank?
    s
  end

  private

  def honeypot_must_be_blank
    errors.add(:base, "Spam detected") if website.present?
  end
end
