import { useState, useCallback } from 'react'

interface Message {
  id: string
  text: string
  sender: 'bot' | 'user'
}

interface Option {
  label: string
  nextStep: string
}

interface Step {
  botMessage: string
  options?: Option[]
}

const steps: Record<string, Step> = {
  welcome: {
    botMessage: '✨ Welcome to Mahalaxmi Jewellery! How can I help you today?',
    options: [
      { label: 'Explore collections', nextStep: 'collections' },
      { label: 'Book an appointment', nextStep: 'appointment' },
      { label: 'Call us', nextStep: 'call_us' },
    ],
  },
  collections: {
    botMessage:
      'We offer exquisite gold, diamond, and platinum collections including bridal sets, everyday wear, and contemporary designs. Would you like to browse our latest catalogue on the website?',
    options: [
      { label: 'View collections', nextStep: 'view_collections' },
      { label: 'Go back', nextStep: 'welcome' },
    ],
  },
  view_collections: {
    botMessage:
      'You can explore our full range at the Collections page. Is there anything specific you\'d like help with?',
    options: [
      { label: 'Talk to an expert', nextStep: 'appointment' },
      { label: 'Go back', nextStep: 'welcome' },
    ],
  },
  appointment: {
    botMessage:
      'We\'d love to meet you! Please call us at +91 9937012345 or visit our showroom in Balasore. You can also book online through our website.',
    options: [
      { label: 'Call now', nextStep: 'call_us' },
      { label: 'Go back', nextStep: 'welcome' },
    ],
  },
  call_us: {
    botMessage:
      'You can reach us at +91 9937012345. Our team is available Mon–Sat 10 AM – 9 PM and Sun 11 AM – 7 PM. We look forward to hearing from you!',
    options: [
      { label: 'Start over', nextStep: 'welcome' },
    ],
  },
}

let msgCounter = 0

function createMessage(text: string, sender: 'bot' | 'user'): Message {
  msgCounter += 1
  return { id: String(msgCounter), text, sender }
}

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepId, setCurrentStepId] = useState<string | null>('welcome')
  const [messages, setMessages] = useState<Message[]>(() => {
    const step = steps['welcome']
    if (!step) return []
    return [createMessage(step.botMessage, 'bot')]
  })

  const toggleChatbot = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const sendMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, createMessage(text, 'user')])

    const matched = Object.entries(steps).find(
      ([_key, step]) =>
        step.options?.some(
          (opt) => opt.label.toLowerCase() === text.toLowerCase().trim()
        )
    )

    if (matched) {
      const [, step] = matched
      setMessages((prev) => [...prev, createMessage(step.botMessage, 'bot')])
      setCurrentStepId(matched[0])
    } else {
      const currentStep = currentStepId ? steps[currentStepId] : null
      if (currentStep?.options) {
        const option = currentStep.options.find(
          (opt) => opt.label.toLowerCase() === text.toLowerCase().trim()
        )
        if (option) {
          const next = steps[option.nextStep]
          if (next) {
            setMessages((prev) => [...prev, createMessage(next.botMessage, 'bot')])
            setCurrentStepId(option.nextStep)
          }
        } else {
          setMessages((prev) => [
            ...prev,
            createMessage(
              getFallbackMessage(currentStep.options ?? []),
              'bot'
            ),
          ])
        }
      } else {
        setMessages((prev) => [
          ...prev,
          createMessage("I didn't quite catch that. Please choose an option above.", 'bot'),
        ])
      }
    }
  }, [currentStepId])

  return {
    isOpen,
    messages,
    currentStepId,
    toggleChatbot,
    sendMessage,
  }
}

function getFallbackMessage(options: Option[]): string {
  const labels = options.map((o) => `"${o.label}"`).join(', ')
  return `Please choose one of the following: ${labels}.`
}
