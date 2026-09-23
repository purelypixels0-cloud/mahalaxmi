export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) || '919937012345'

export const WHATSAPP_DEFAULT_MESSAGE = "Hi, I'd like to enquire about your jewellery collection."

export const whatsappLink = (message: string = WHATSAPP_DEFAULT_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`