import { useState, useEffect } from 'react'
import { BrowserRouter, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import About from './pages/About'
import './App.css'

function NavLink({ to, children, isActive, onClick }) {
  return (
    <Link 
      to={to} 
      className={'nav-link' + (isActive ? ' active' : '')}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

function NavIndicator({ isAbout }) {
  return (
    <div 
      className="nav-indicator"
      style={{ 
        transform: isAbout ? 'translateX(100%)' : 'translateX(0)',
      }}
    />
  )
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
  const isAbout = location.pathname === '/about'

useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  

  const toggleTheme = () => {
    setIsRotating(true)
    setIsDark(!isDark)
    setTimeout(() => setIsRotating(false), 500)
  }

  const pageContent = isAbout ? <About /> : <Home />

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
          <NavIndicator isAbout={isAbout} />
          <NavLink to="/" isActive={!isAbout}>Home</NavLink>
          <NavLink to="/about" isActive={isAbout}>About</NavLink>
        </nav>
      </header>
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={isAbout ? 'about' : 'home'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {pageContent}
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