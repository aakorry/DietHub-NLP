import { useState, useRef, useEffect } from 'react'

const baseValue = 0.431529
const finalPrediction = 1.3183

const positiveFeatures = [
  { token: 'g', value: 0.1330 },
  { token: 'FRUS', value: 0.1005 },
  { token: 'honey', value: 0.0994 },
  { token: 'CHOCDF', value: 0.0985 },
  { token: '92', value: 0.0898 },
  { token: 'sugar', value: 0.0849 },
  { token: '1', value: 0.0787 },
  { token: '42', value: 0.0706 },
  { token: '07', value: 0.0705 },
  { token: 'ENERC_KCAL', value: 0.0568 },
  { token: '385', value: 0.0568 },
  { token: 'tsp', value: 0.0486 },
  { token: 'vanilla', value: 0.0486 },
  { token: 'milk', value: 0.0474 },
  { token: '200', value: 0.0336 },
]

const negativeFeatures = [
  { token: '0', value: -0.2813 },
  { token: 'servings', value: -0.1538 },
  { token: 'extract', value: -0.1326 },
  { token: '5', value: -0.1308 },
  { token: '96', value: -0.0377 },
]

const totalPos = +positiveFeatures.reduce((s, f) => s + f.value, 0).toFixed(4)
const totalNeg = +negativeFeatures.reduce((s, f) => s + Math.abs(f.value), 0).toFixed(4)

const allTokens = [
  { token: '0', shap: -0.281339, abs: 0.281339, direction: 'Decrease' },
  { token: 'servings', shap: -0.153833, abs: 0.153833, direction: 'Decrease' },
  { token: 'g', shap: 0.133033, abs: 0.133033, direction: 'Increase' },
  { token: 'extract', shap: -0.132619, abs: 0.132619, direction: 'Decrease' },
  { token: '5', shap: -0.130788, abs: 0.130788, direction: 'Decrease' },
  { token: 'FRUS', shap: 0.100457, abs: 0.100457, direction: 'Increase' },
  { token: 'honey', shap: 0.099408, abs: 0.099408, direction: 'Increase' },
  { token: 'CHOCDF', shap: 0.098467, abs: 0.098467, direction: 'Increase' },
  { token: '92', shap: 0.089786, abs: 0.089786, direction: 'Increase' },
  { token: 'sugar', shap: 0.084919, abs: 0.084919, direction: 'Increase' },
  { token: '1', shap: 0.078746, abs: 0.078746, direction: 'Increase' },
  { token: '42', shap: 0.070576, abs: 0.070576, direction: 'Increase' },
  { token: '07', shap: 0.070468, abs: 0.070468, direction: 'Increase' },
  { token: 'ENERC_KCAL', shap: 0.056809, abs: 0.056809, direction: 'Increase' },
  { token: '385', shap: 0.056809, abs: 0.056809, direction: 'Increase' },
  { token: 'tsp', shap: 0.048552, abs: 0.048552, direction: 'Increase' },
  { token: 'vanilla', shap: 0.048552, abs: 0.048552, direction: 'Increase' },
  { token: 'milk', shap: 0.047362, abs: 0.047362, direction: 'Increase' },
  { token: '96', shap: -0.037697, abs: 0.037697, direction: 'Decrease' },
  { token: '200', shap: 0.033625, abs: 0.033625, direction: 'Increase' },
]

const maxAbs = Math.max(...allTokens.map(t => t.abs))

const limeData = [
  { token: '0', weight: -1.196093, abs: 1.196093 },
  { token: 'servings', weight: -0.483496, abs: 0.483496 },
  { token: '5', weight: -0.399227, abs: 0.399227 },
  { token: 'ENERC_KCAL', weight: -0.343786, abs: 0.343786 },
  { token: 'honey', weight: 0.288362, abs: 0.288362 },
  { token: '385', weight: 0.269784, abs: 0.269784 },
  { token: 'sugar', weight: 0.227297, abs: 0.227297 },
  { token: '144', weight: 0.169411, abs: 0.169411 },
  { token: 'vanilla', weight: 0.146428, abs: 0.146428 },
  { token: '3', weight: -0.130655, abs: 0.130655 },
  { token: 'CHOCDF', weight: 0.114230, abs: 0.114230 },
  { token: 'WATER', weight: -0.109509, abs: 0.109509 },
  { token: 'recipe_name', weight: 0.105119, abs: 0.105119 },
  { token: 'FAT', weight: -0.074263, abs: 0.074263 },
  { token: 'PROCNT', weight: -0.052366, abs: 0.052366 },
]
const maxLimeAbs = Math.max(...limeData.map(t => t.abs))

const captumData = [
  { token: '0', score: -0.710761, abs: 0.710761, pct: 25.286552 },
  { token: 'honey', score: 0.273712, abs: 0.273712, pct: 9.737792 },
  { token: 'sugar', score: 0.196646, abs: 0.196646, pct: 6.996025 },
  { token: '16', score: -0.154501, abs: 0.154501, pct: 5.496647 },
  { token: 'serving', score: -0.128468, abs: 0.128468, pct: 4.570480 },
  { token: 'g', score: -0.001125, abs: 0.114742, pct: 4.082136 },
  { token: '3', score: -0.090689, abs: 0.090689, pct: 3.226413 },
  { token: 's', score: -0.063276, abs: 0.065584, pct: 2.333261 },
  { token: 'f', score: 0.059644, abs: 0.062933, pct: 2.238963 },
  { token: 'al', score: -0.052738, abs: 0.052738, pct: 1.876247 },
  { token: 'water', score: -0.048154, abs: 0.048154, pct: 1.713148 },
  { token: 'vanilla', score: 0.046344, abs: 0.046344, pct: 1.648770 },
  { token: 'ingredients', score: -0.041509, abs: 0.041509, pct: 1.476755 },
  { token: 'fat', score: -0.041007, abs: 0.041007, pct: 1.458907 },
  { token: '42', score: 0.040751, abs: 0.040751, pct: 1.449802 },
  { token: 'fr', score: 0.038147, abs: 0.038147, pct: 1.357129 },
  { token: 'us', score: 0.033257, abs: 0.033257, pct: 1.183177 },
  { token: 'kc', score: -0.033034, abs: 0.033034, pct: 1.175246 },
  { token: '2', score: -0.032841, abs: 0.032841, pct: 1.168382 },
  { token: 'milk', score: 0.030217, abs: 0.030217, pct: 1.075039 },
]
const maxCaptumAbs = Math.max(...captumData.map(t => t.abs))

const counterfactualCases = [
  { label: 'Original', output: 1.3183 },
  { label: 'Lower\nSugar', output: 1.2914 },
  { label: 'Higher\nSugar', output: 1.3161 },
  { label: 'No\nHoney', output: 1.2358 },
  { label: 'More\nHoney', output: 1.3194 },
  { label: 'More\nServings', output: 0.9695 },
  { label: 'Fewer\nServings', output: 1.9741 },
]
const maxCfOutput = Math.max(...counterfactualCases.map(d => d.output))

function ForceBlock({ label, value, color, direction }) {
  const [hovered, setHovered] = useState(false)
  const isPos = direction === 'pos'

  return (
    <div
      className="force-block"
      style={{
        background: isPos ? '#CCE3FD' : color === 'base' ? '#EEEEEE' : color === 'collision' ? '#FFFFFF' : color === 'final' ? '#FFFFFF' : '#FFCCD5',
        color: isPos ? '#002060' : color === 'final' ? '#000000' : '#800020',
        border: color === 'collision' ? '2px dashed #FF4D6D' : color === 'base' || color === 'final' ? '2px solid #333' : 'none',
        fontWeight: color === 'final' ? 700 : color === 'base' ? 600 : 600,
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        whiteSpace: 'nowrap',
        cursor: 'default',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span>{label}</span>
      {isPos && <span style={{ fontSize: '0.6rem' }}>→</span>}
      {direction === 'neg' && <span style={{ fontSize: '0.6rem' }}>←</span>}
      {hovered && value !== null && typeof value === 'object' ? (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: '#CCE3FD' }}>+{value.pos}</span>
          <span style={{ margin: '0 6px', color: '#999' }}>← ∑ →</span>
          <span style={{ color: '#FFCCD5' }}>−{value.neg}</span>
        </div>
      ) : hovered && value !== null && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {value > 0 ? '+' : ''}{value.toFixed(4)}
        </div>
      )}
    </div>
  )
}

function ForceArrow() {
  return (
    <div
      style={{
        width: '16px',
        height: '2px',
        background: '#999',
        flexShrink: 0,
        position: 'relative',
      }}
    />
  )
}

function CounterfactualBarChart() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="cf-chart-wrapper" ref={ref}>
      <div className="cf-chart">
        <div
          className="cf-baseline"
          style={{ bottom: `${30 + (counterfactualCases[0].output / maxCfOutput) * 260}px` }}
        />
        {counterfactualCases.map((c, i) => {
          const height = visible ? (c.output / maxCfOutput) * 260 : 0
          return (
            <div key={i} className="cf-bar-group">
              <div className="cf-value">{c.output.toFixed(4)}</div>
              <div className="cf-bar" style={{ height: `${height}px` }} />
              <div className="cf-label">{c.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BarPlot({ data, maxAbs, valueKey, columnLabel, centerLabel }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ marginTop: '0.75rem' }} ref={ref}>
      <div style={{ position: 'relative', height: '20px' }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: '#ddd' }} />
        <span style={{ position: 'absolute', left: 'calc(50% + 6px)', top: 0, fontSize: '0.65rem', color: '#22c55e' }}>
          {centerLabel}
        </span>
      </div>
      <div style={{
        display: 'flex', padding: '0.4rem 0', fontSize: '0.7rem',
        color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ width: '80px', flexShrink: 0 }}>Token</span>
        <span style={{ flex: 1, textAlign: 'center' }}>Contribution</span>
        <span style={{ width: '80px', flexShrink: 0, textAlign: 'right' }}>{columnLabel}</span>
      </div>
      {data.map((t, i) => {
        const targetPct = (t.abs / maxAbs) * 50
        const barPct = visible ? targetPct : 0
        const isPos = t[valueKey] >= 0
        return (
          <div key={i} className="bar-row" style={{ display: 'flex', alignItems: 'center', height: '26px' }}>
            <span style={{ width: '80px', flexShrink: 0, paddingRight: '8px', fontSize: '0.75rem', textAlign: 'right' }}>
              <code style={{ padding: '1px 4px', borderRadius: '3px', fontSize: '0.7rem', color: '#999' }}>{t.token}</code>
            </span>
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: '#ddd' }} />
              <div style={{
                position: 'absolute',
                left: isPos ? '50%' : `${50 - barPct}%`,
                width: `${barPct}%`,
                height: '14px', top: '50%', transform: 'translateY(-50%)',
                borderRadius: '3px',
                background: isPos ? '#CCE3FD' : '#FFCCD5',
                border: isPos ? '1px solid #4A90E2' : '1px solid #FF4D6D',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
            <span className="shap-value" style={{ width: '80px', flexShrink: 0, paddingLeft: '8px', fontSize: '0.75rem', fontWeight: 600, textAlign: 'right', color: '#999' }}>
              {t[valueKey] > 0 ? '+' : ''}{t[valueKey].toFixed(4)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ExplainableAI() {
  return (
    <section className="about-page-section">
      <h2>Explainable AI</h2>
      <p className="about-description">
        SHAP (SHapley Additive exPlanations) explains how each input token
        contributes to moving the prediction away from a baseline value.
      </p>
      <p className="about-description" style={{ marginTop: '0.5rem' }}>
        LIME (Local Interpretable Model-agnostic Explanations) explains a single
        prediction by slightly perturbing the input text and estimating which words
        increase or decrease the model's output.
      </p>
      <p className="about-description" style={{ marginTop: '0.5rem' }}>
        Captum Integrated Gradients computes the gradient of the model's output
        with respect to each input token, measuring how small changes affect the prediction.
      </p>
      <p className="about-description" style={{ marginTop: '0.5rem' }}>
        Counterfactual Sensitivity Testing modifies specific recipe values
        (sugar amount, honey amount, serving size) and observes whether the model's
        prediction changes in the expected direction.
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
        * Single example tested using DistilBERT, shown for demonstration and educational purposes only.
      </p>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>
        The test case recipe below was used as input:
      </p>
      <pre className="lime-input">
recipe_name: Test cook | ingredients: 200 g sugar, 42 g honey, 1 cup milk, 1 tsp vanilla extract | servings: 5.0 |
STARCH: 2.01 | FIBTG: 3.98 | WATER: 144.97 | FAT: 28.83 | PROCNT: 18.07 | CHOCDF: 16.64 | ENERC_KCAL: 385.41 | SUCS: 0.73
| GLUS: 0.92 | FRUS: 0.96 | LACS: 0.79 | MALS: 0.05 | GALS: 0.12 | CHOLE: 0.22 | ASH: 3.65 | CAFFN: 0.01
      </pre>

      <h3>SHAP Force Plot</h3>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', justifyContent: 'center' }}>
        <div className="legend-swatch" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#CCE3FD' }} />
          <span style={{ fontSize: '0.8rem' }}>Increases prediction (more sugar)</span>
        </div>
        <div className="legend-swatch" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#FFCCD5' }} />
          <span style={{ fontSize: '0.8rem' }}>Decreases prediction (less sugar)</span>
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'center', marginBottom: '1rem' }}>
        Hover any block to see its exact SHAP value.
      </p>

      <div
        style={{
          overflowX: 'auto',
          padding: '2.5rem 0.5rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            minWidth: 'max-content',
          }}
        >
          <ForceBlock label={`Base (${baseValue})`} value={null} color="base" />
          <ForceArrow />
          {positiveFeatures.map((f, i) => (
            <span key={`pos-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <ForceBlock label={f.token} value={f.value} direction="pos" />
              <ForceArrow />
            </span>
          ))}
          <ForceBlock label="∑ threshold" value={{ neg: totalNeg, pos: totalPos }} color="collision" />
          {negativeFeatures.map((f, i) => (
            <span key={`neg-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <ForceArrow />
              <ForceBlock label={f.token} value={f.value} direction="neg" />
            </span>
          ))}
          <ForceArrow />
          <ForceBlock label={`Prediction: ${finalPrediction}`} value={null} color="final" />
        </div>
      </div>

      <h3>Observation</h3>
      <div className="about-description" style={{ lineHeight: 1.8 }}>
        <p><strong>Test case:</strong> <code>200 g sugar, 42 g honey, 1 cup milk, 1 tsp vanilla extract | servings: 5.0 | CHOCDF: 16.64 | ENERC_KCAL: 385.41 | FRUS: 0.96</code></p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li>Baseline: <strong>0.4315</strong> → Final prediction: <strong>1.3183</strong></li>
          <li>Sugar-related tokens (<code>sugar</code>, <code>honey</code>) positively contribute — aligns with prediction task</li>
          <li><code>CHOCDF</code>, <code>milk</code>, <code>vanilla</code> also increase prediction — reasonable (indirect sugar associations)</li>
          <li>Serving tokens (<code>servings</code>, <code>5</code>, <code>0</code>) decrease prediction — correct for "sugar per serving"</li>
          <li>Isolated numerical tokens (e.g. <code>92</code>, <code>07</code>, <code>385</code>) likely fragment artifacts — interpret with caution</li>
          <li>SHAP identifies <strong>which</strong> tokens matter but not <strong>how much</strong> ingredient quantity affects output — counterfactual testing needed</li>
        </ul>
      </div>

      <h3>Token Contribution</h3>
      <BarPlot data={allTokens} maxAbs={maxAbs} valueKey="shap" columnLabel="SHAP Value" centerLabel={`baseline (${baseValue})`} />

      <h3 style={{ marginBottom: '1rem' }}>LIME Explanation</h3>

      <h4 style={{ marginBottom: '0.75rem' }}>Observation, Explain & Summarise</h4>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
        <li>LIME explains a single prediction by slightly perturbing the input text and estimating which words or tokens increase or decrease the model's predicted value.</li>
        <li>Predicted sugar-per-serving: <strong>1.3183 g</strong></li>
        <li>Numerical tokens (<code>0</code>, <code>5</code>, <code>385</code>, <code>144</code>) should be treated with caution — likely fragments of decimal values or structured nutrition fields, not standalone features.</li>
        <li>Positive contributors: <code>honey</code>, <code>sugar</code>, <code>vanilla</code>, <code>CHOCDF</code> — directly or indirectly related to sweetness / carbohydrate content, consistent with the prediction task.</li>
        <li>Negative contributors: <code>servings</code>, <code>ENERC_KCAL</code>, <code>WATER</code>, <code>FAT</code>, <code>PROCNT</code>.</li>
        <li><code>servings</code> + <code>5</code> + <code>0</code> map to original text "servings: 5.0" — larger serving size lowers sugar per serving, so negative contribution is logically aligned.</li>
        <li>Overall LIME explanation aligns with project objective: serving-related tokens decrease prediction, sugar-related tokens increase prediction.</li>
        <li>LIME alone is insufficient to fully validate the model's quantitative reasoning — counterfactual or sensitivity testing recommended to verify that changes in sugar, honey, and serving size produce consistent prediction changes.</li>
      </ul>

      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Word / Token Contribution</h4>
      <BarPlot data={limeData} maxAbs={maxLimeAbs} valueKey="weight" columnLabel="LIME Value" centerLabel="0" />

      <h3 style={{ marginBottom: '1rem' }}>Captum Explanation</h3>

      <h4 style={{ marginBottom: '0.75rem' }}>Observation, Explain & Summarise</h4>
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
        <li>Captum Integrated Gradients illustrates how individual tokens contribute to the model's predicted sugar-per-serving value.</li>
        <li>Predicted sugar-per-serving: <strong>2.74 g</strong> (raw model output: <strong>1.3183</strong>)</li>
        <li>Alphabetic fragments like <code>f</code>, <code>al</code>, <code>s</code>, <code>fr</code>, <code>us</code> are BERT subword tokenization artifacts from nutrition abbreviations — not meaningful standalone words.</li>
        <li>Meaningful positive contributors: <code>honey</code>, <code>sugar</code>, <code>vanilla</code>, <code>milk</code> — directly or indirectly related to sugar content.</li>
        <li>Strongest negative contributor: <code>serving</code> — technically reasonable (more servings → lower sugar per serving).</li>
        <li><code>water</code> also decreases prediction — higher water content may dilute sugar concentration.</li>
        <li>Negative contributions of <code>ingredients</code> and <code>fat</code> are less directly explainable — interpret with caution.</li>
        <li>Overall Captum result aligns with prediction objective: meaningful tokens reflect relevant recipe and nutrition information.</li>
      </ul>

      <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Word / Token Contribution</h4>
      <BarPlot data={captumData} maxAbs={maxCaptumAbs} valueKey="score" columnLabel="Captum Value" centerLabel="0" />

      <h3 style={{ marginBottom: '1rem' }}>Counterfactual Sensitivity Testing</h3>

      <div className="about-description" style={{ marginBottom: '1rem' }}>
        <p><strong>Baseline raw model output:</strong> 1.318297</p>
        <p><strong>Aligned cases:</strong> 5 / <strong>Not aligned cases:</strong> 1 / <strong>Replacement failed cases:</strong> 0</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          <strong>Interpretation guide:</strong>
        </p>
        <ul style={{ fontSize: '0.8rem', paddingLeft: '1.25rem', lineHeight: 1.7 }}>
          <li><strong>Aligned</strong> — prediction changed in the expected direction.</li>
          <li><strong>Not Aligned</strong> — model did not respond as expected.</li>
          <li><strong>Replacement Failed</strong> — pattern was not found in the original text.</li>
        </ul>
      </div>

      <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
        <li>Baseline raw output: <strong>1.3183</strong> → ~<strong>2.74 g</strong> sugar per serving.</li>
        <li><strong>5 out of 6</strong> counterfactual cases aligned with expected prediction direction.</li>
        <li>Non-aligned case: <strong>Higher sugar</strong> (200g → 400g) — output slightly decreased instead of increasing.</li>
        <li>Most significant effect: <strong>serving size</strong> — more servings (5→10) decreased output from 1.3183→0.9695; fewer servings (5→2) increased output to 1.9741.</li>
        <li>Model more sensitive to sugar-related <strong>keywords</strong> than exact numerical quantities (text-based tokenization limitation).</li>
        <li>Recommendation: extract numerical features (sugar qty, servings, qty-per-serving) and combine with BERT text representation.</li>
      </ul>

      <CounterfactualBarChart />
    </section>
  )
}
