export default function About() {
  return (
    <>
      <section className="about-page-section">
        <h2>About Diabetes Guard</h2>
        <p className="about-description">
          Diabetes Guard is an AI-powered tool that predicts sugar content in recipes
          using the TinyLlama language model with QLoRA fine-tuning. Trained on the
          ingredient-to-sugar-level dataset, it helps users make informed dietary choices
          based on WHO sugar guidelines for diabetes prevention and management.
        </p>
        
        <h3>Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h4>AI-Powered Prediction</h4>
            <p>Uses TinyLlama with QLoRA fine-tuning for accurate sugar level predictions</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🍰</span>
            <h4>Recipe Generation</h4>
            <p>Generate complete recipes from dish names with detailed ingredients</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h4>WHO Guidelines</h4>
            <p>Health recommendations based on WHO sugar intake categories</p>
          </div>
        </div>

        <h3>How It Works</h3>
        <div className="how-it-works">
          <div className="step">
            <span className="step-number">1</span>
            <p>Enter ingredients or dish name</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>Get sugar prediction with WHO category</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Make informed dietary choices</p>
          </div>
        </div>

        <h3>WHO Sugar Guidelines</h3>
        <div className="guide-table">
          <div className="guide-row header-row">
            <span>Category</span>
            <span>Sugar per Serving</span>
            <span>Recommendation</span>
          </div>
          <div className="guide-row" data-category="Low">
            <span>Low</span>
            <span>&lt;10g</span>
            <span>Recommended for diabetes prevention</span>
          </div>
          <div className="guide-row" data-category="Medium">
            <span>Medium</span>
            <span>10-25g</span>
            <span>Acceptable in moderation</span>
          </div>
          <div className="guide-row" data-category="High">
            <span>High</span>
            <span>25-40g</span>
            <span>Limit consumption</span>
          </div>
          <div className="guide-row" data-category="Very High">
            <span>Very High</span>
            <span>&gt;40g</span>
            <span>Avoid frequent consumption</span>
          </div>
        </div>
      </section>
    </>
  )
}