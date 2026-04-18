function Logo({ size = 'normal' }) {
  const sizes = {
    small: { width: 32, fontSize: '1.25rem' },
    normal: { width: 40, fontSize: '1.5rem' },
    large: { width: 48, fontSize: '1.75rem' }
  }
  const s = sizes[size] || sizes.normal

  return (
    <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        width={s.width}
        height={s.width}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Diabetes Guard Logo"
      >
        <circle cx="20" cy="20" r="18" fill="var(--cat-medium-bg, #dbeafe)" />
        <path
          d="M20 8C14.48 8 10 12.48 10 18C10 23.52 14.48 28 20 28C25.52 28 30 23.52 30 18C30 12.48 25.52 8 20 8ZM20 26C15.58 26 12 22.42 12 18C12 13.58 15.58 10 20 10C24.42 10 28 13.58 28 18C28 22.42 24.42 26 20 26Z"
          fill="var(--primary, #2563eb)"
        />
        <path
          d="M18 16L17 21H23L22 16H18Z"
          fill="var(--primary, #2563eb)"
        />
        <circle cx="20" cy="24" r="2" fill="var(--primary, #2563eb)" />
        <path
          d="M19 14V15M21 14V15M19 25V26M21 25V26"
          stroke="var(--primary, #2563eb)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="logo-text" style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: s.fontSize, fontWeight: 700, color: 'var(--primary, #1e40af)', lineHeight: 1.2 }}>
          Diabetes Guard
        </span>
        <span style={{ fontSize: s.fontSize * 0.5, color: 'var(--text-light, #64748b)', fontWeight: 500 }}>
          Sugar Level Prediction
        </span>
      </div>
    </div>
  )
}

export default Logo