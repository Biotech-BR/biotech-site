Rails.application.routes.draw do
  root "pages#home"
  get "/home",     to: "pages#home"
  get "/sobre",    to: "pages#about"
  get "/servicos", to: "pages#services"
  get "/contato",  to: "pages#contact"
  post "/contato", to: "contacts#create"

  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end
end
