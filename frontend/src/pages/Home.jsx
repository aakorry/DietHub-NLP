import { useState, useEffect, useRef } from 'react'
import { predictSugar, getCategoryFromSugar, getWhoInfoStatic, generateRecipe, HEALTH_QUOTES, FUNCTIONAL_QUOTES } from '../services/api'
import Logo from '../components/Logo'

function LoadingSpinner() {
  return <span className="loading-spinner"></span>
}

export default function Home() {
  const [ingredients, setIngredients] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generateMode, setGenerateMode] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(0)
  const [generatedRecipe, setGeneratedRecipe] = useState(false)
  const [showPredictBtn, setShowPredictBtn] = useState(false)
  const [randomQuote, setRandomQuote] = useState('')
  const typingRef = useRef(null)
  const explanationTypingRef = useRef(null)
  const [explanationTyped, setExplanationTyped] = useState('')
  const [isExplanationTyping, setIsExplanationTyping] = useState(false)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * FUNCTIONAL_QUOTES.length)
    setRandomQuote(FUNCTIONAL_QUOTES[randomIndex])
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % HEALTH_QUOTES.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const typeWriter = async (text, speed = 30) => {
    setIsTyping(true)
    setIngredients('')
    let index = 0
    typingRef.current = setInterval(() => {
      if (index < text.length) {
        setIngredients(prev => prev + text.charAt(index))
        index++
      } else {
        clearInterval(typingRef.current)
        setIsTyping(false)
      }
    }, speed)
  }

  const cancelTyping = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current)
    }
    setIsTyping(false)
  }

  const typeWriterExplanation = (text, speed = 10) => {
    if (explanationTypingRef.current) {
      clearInterval(explanationTypingRef.current)
    }
    setIsExplanationTyping(true)
    setExplanationTyped('')
    let index = 0
    explanationTypingRef.current = setInterval(() => {
      if (index < text.length) {
        setExplanationTyped(prev => prev + text.charAt(index))
        index++
      } else {
        clearInterval(explanationTypingRef.current)
        setIsExplanationTyping(false)
      }
    }, speed)
  }

  const handleRegenerateRecipe = async () => {
    if (!ingredients.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    cancelTyping()
    setGeneratedRecipe(false)
    setShowPredictBtn(false)

    try {
      const generated = await generateRecipe(ingredients)
      await typeWriter(generated, 15)

      setTimeout(() => {
        setIsTyping(false)
        setGeneratedRecipe(true)
        setShowPredictBtn(true)
      }, generated.length * 15 + 100)
    } catch (e) {
      setError(e.message || 'Failed to generate recipe')
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!ingredients.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await predictSugar(ingredients)

      setResult({
        sugarG: response.sugarG,
        category: response.category,
        explanation: response.explanation,
        whoInfo: getWhoInfoStatic(response.category)
      })

      if (generatedRecipe && isTyping) {
        const recipeLength = ingredients.length
        setTimeout(() => {
          typeWriterExplanation(response.explanation, 10)
        }, recipeLength * 15 + 200)
      } else if (generatedRecipe) {
        typeWriterExplanation(response.explanation, 10)
      } else {
        typeWriterExplanation(response.explanation, 10)
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Make sure Ollama is running (ollama serve) and backend is up.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    cancelTyping()
    if (explanationTypingRef.current) {
      clearInterval(explanationTypingRef.current)
    }
    setIsExplanationTyping(false)
    setExplanationTyped('')
    setIngredients('')
    setResult(null)
    setError('')
    setGeneratedRecipe(false)
    setShowPredictBtn(false)
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (generateMode) {
        handleRegenerateRecipe()
      } else {
        handlePredict()
      }
    }
  }

  return (
    <>
      <section className="input-section">
        <div className="toggle-container">
          <span className={`toggle-label ${!generateMode ? 'active' : ''}`}>Predict Only</span>
          <div
            className={`toggle-switch ${generateMode ? 'active' : ''}`}
            onClick={() => {
              setGenerateMode(!generateMode)
              setGeneratedRecipe(false)
              setShowPredictBtn(false)
              setIngredients('')
              setResult(null)
            }}
            role="switch"
            aria-checked={generateMode}
          >
            <div className="toggle-knob"></div>
          </div>
          <span className={`toggle-label ${generateMode ? 'active' : ''}`}>Generate + Predict</span>
        </div>

        <label htmlFor="ingredients" className="input-label">
          {generateMode ? 'Dish Name' : 'Recipe Ingredients'}
        </label>
        <textarea
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            generateMode
              ? 'Enter dish name (e.g., Chocolate Cake, Apple Pie...)'
              : 'Enter ingredients (e.g., 1 cup flour, 2 eggs, 1 cup sugar...)'
          }
          disabled={loading || isTyping}
          className={`input-textarea ${isTyping ? 'typing' : ''}`}
        />

        <div className="button-group">
          {generateMode ? (
            <button
              onClick={handleRegenerateRecipe}
              disabled={loading || !ingredients.trim() || isTyping}
              className="generate-btn"
            >
              {loading ? <><LoadingSpinner /> Generating...</> : isTyping ? <><LoadingSpinner /> Typing...</> : 'ReGenerate Recipe'}
            </button>
          ) : (
            <button onClick={handlePredict} disabled={loading || !ingredients.trim()} className="predict-btn">
              {loading ? <><LoadingSpinner /> {isExplanationTyping ? 'Typing...' : 'Analyzing...'}</> : 'Predict Sugar'}
            </button>
          )}
          <button onClick={handleClear} className="secondary" disabled={loading}>
            {isTyping ? 'Skip' : 'Clear'}
          </button>
        </div>

        {showPredictBtn && generatedRecipe && (
          <div className="predict-section">
            <p className="predict-hint">You can edit the recipe above, then click Predict Sugar</p>
            <button
              onClick={handlePredict}
              disabled={loading || !ingredients.trim()}
              className="predict-from-generated"
            >
              {loading ? <><LoadingSpinner /> Predicting...</> : 'Predict Sugar'}
            </button>
          </div>
        )}

        {isTyping && (
          <p className="typing-indicator">
            <span className="cursor">|</span> Generating recipe...
          </p>
        )}
      </section>

      {error && (
        <div className="error">
          <span className="error-icon">⚠</span>
          <div className="error-content">
            <p>Error: {error}</p>
            <p className="hint">Make sure backend is running (./run.sh) and Ollama is up (ollama serve)</p>
          </div>
        </div>
      )}

      {result && (
        <section className="result-section">
          <div className="prediction-card" data-category={result.category}>
            <div className="sugar-value">
              <span className="value">{result.sugarG.toFixed(1)}g</span>
              <span className="category">{result.category}</span>
            </div>
            <div className="who-info">
              <p className="range">{result.whoInfo.range}</p>
              <p className="description">{result.whoInfo.description}</p>
            </div>
          </div>

          <div className="explanation-card">
            <h3>Recipe Recommendations</h3>
            <p>{explanationTyped || result.explanation}</p>
          </div>

          <div className="who-guide">
            <h3>WHO Sugar Guidelines</h3>
            <div className="guide-grid">
              <div className="guide-item" data-category="Low">
                <span className="label">Low</span>
                <span className="range">&lt;10g</span>
              </div>
              <div className="guide-item" data-category="Medium">
                <span className="label">Medium</span>
                <span className="range">10-25g</span>
              </div>
              <div className="guide-item" data-category="High">
                <span className="label">High</span>
                <span className="range">25-40g</span>
              </div>
              <div className="guide-item" data-category="Very High">
                <span className="label">Very High</span>
                <span className="range">&gt;40g</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {result && (
        <section className="quote-section">
          <div className="quote-container">
            <span className="quote-icon">"</span>
            <p className="quote-text">{randomQuote}</p>
          </div>
        </section>
      )}

      {!result && !error && !loading && (
        <div className="placeholder">
          <p>Enter your recipe or dish name above</p>
          {randomQuote && <p className="random-quote">{randomQuote}</p>}
        </div>
      )}
    </>
  )
}