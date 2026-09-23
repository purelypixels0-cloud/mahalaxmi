import { lazy, Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ChatbotLauncher from '../components/chatbot/ChatbotLauncher'
import ChatbotWindow from '../components/chatbot/ChatbotWindow'
import GoldDust from '../components/common/GoldDust'
import { useChatbot } from '../hooks/useChatbot'

const HomePage = lazy(() => import('../pages/HomePage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const CataloguePage = lazy(() => import('../pages/CataloguePage'))
const CollectionDetailPage = lazy(() => import('../pages/CollectionDetailPage'))
const CollectionsPage = lazy(() => import('../pages/CollectionsPage'))
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'))
const SchemesPage = lazy(() => import('../pages/SchemesPage'))
const JournalPage = lazy(() => import('../pages/JournalPage'))
const JournalDetailPage = lazy(() => import('../pages/JournalDetailPage'))
const AppointmentPage = lazy(() => import('../pages/AppointmentPage'))
const ContactPage = lazy(() => import('../pages/ContactPage'))
const AdminApp = lazy(() => import('../pages/admin/AdminApp'))

export const easing = [0.16, 1, 0.3, 1] as const

export const navItemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
}

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-ivory">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-plum/30 border-t-plum" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: easing }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/catalogue/:category" element={<CataloguePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<CollectionDetailPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalDetailPage />} />
          <Route path="/book-appointment" element={<AppointmentPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function AppContent() {
  const { isOpen, messages, currentStepId, toggleChatbot, sendMessage } = useChatbot()

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-ivory font-body text-teal-dark antialiased">
        <GoldDust />
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatedRoutes />
          </Suspense>
        </main>
        <Footer />
        <ChatbotLauncher onClick={toggleChatbot} isOpen={isOpen} />
        {isOpen && (
          <ChatbotWindow
            messages={messages}
            currentStepId={currentStepId}
            onSendMessage={sendMessage}
            onClose={toggleChatbot}
          />
        )}
      </div>
    </BrowserRouter>
  )
}

function Loader() {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'done'>('intro')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const t = setTimeout(() => setPhase('done'), 100)
      return () => clearTimeout(t)
    }

    const t1 = setTimeout(() => setPhase('reveal'), 2800)
    const t2 = setTimeout(() => setPhase('done'), 2800 + 1400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (phase === 'done') return <AppContent />

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-maroon px-8">
      <motion.div
        layoutId="brand-logo"
        className="flex flex-col items-center"
        initial={phase === 'intro' ? { clipPath: 'inset(0 100% 0 0)', opacity: 0.3, scale: 0.97 } : undefined}
        animate={
          phase === 'intro'
            ? { clipPath: 'inset(0 0% 0 0)', opacity: 1, scale: 1 }
            : { opacity: 0, scale: 1.04 }
        }
        transition={
          phase === 'intro'
            ? { duration: 2.1, ease: easing }
            : { duration: 1.4, ease: easing }
        }
      >
        <motion.img
          src="/logo-loader.png"
          alt="Mahalaxmi Jewellery"
          draggable={false}
          className="h-auto w-[min(72vw,440px)] select-none"
        />
      </motion.div>
    </div>
  )
}

export default function AppRouter() {
  return <Loader />
}
