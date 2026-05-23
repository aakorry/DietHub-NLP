import { useState, useEffect, useRef, forwardRef } from 'react'
import { BrowserRouter, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import About from './pages/About'
import ExplainableAI from './pages/ExplainableAI'
import './App.css'

const NavLink = forwardRef(({ to, children, isActive, onClick }, ref) => {
  return (
    <Link 
      ref={ref}
      to={to} 
      className={'nav-link' + (isActive ? ' active' : '')}
      onClick={onClick}
    >
      {children}
    </Link>
  )
})

function NavIndicator({ activePage, linkRefs }) {
  const indicatorRef = useRef(null)

  useEffect(() => {
    const idx = { home: 0, about: 1, explainable: 2 }[activePage]
    const activeLink = linkRefs.current[idx]
    if (activeLink && indicatorRef.current) {
      indicatorRef.current.style.width = activeLink.offsetWidth + 'px'
      indicatorRef.current.style.transform = `translateX(${activeLink.offsetLeft - 4}px)`
    }
  }, [activePage, linkRefs])

  return <div ref={indicatorRef} className="nav-indicator" />
}

function ThemeToggle({ isDark, onToggle, isRotating }) {
  return (
    <button 
      className={`theme-toggle ${isRotating ? 'rotating' : ''}`}
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

function AppContent() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isRotating, setIsRotating] = useState(false)
  const location = useLocation()
  const linkRefs = useRef([])

  const pagePaths = { '/about': 'about', '/explainable-ai': 'explainable' }
  const activePage = pagePaths[location.pathname] ?? 'home'

useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  

  const toggleTheme = () => {
    setIsRotating(true)
    setIsDark(!isDark)
    setTimeout(() => setIsRotating(false), 500)
  }

  const pages = { home: Home, about: About, explainable: ExplainableAI }
  const PageComponent = pages[activePage]

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <div className="header-title">
            <h1 style={{ color: '#6366f1' }}>Diabetes Guard</h1>
            <p className="header-subtitle">Predict Sugar Content in Your Recipes</p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} isRotating={isRotating} />
        </div>
        <nav className="nav-links">
          <NavIndicator activePage={activePage} linkRefs={linkRefs} />
          <NavLink ref={el => linkRefs.current[0] = el} to="/" isActive={activePage === 'home'}>Home</NavLink>
          <NavLink ref={el => linkRefs.current[1] = el} to="/about" isActive={activePage === 'about'}>About</NavLink>
          <NavLink ref={el => linkRefs.current[2] = el} to="/explainable-ai" isActive={activePage === 'explainable'}>Explainable AI</NavLink>
        </nav>
      </header>
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="footer">
        <p>Diabetes Guard - NLP Assignment | Powered by Llama 7B + React</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App