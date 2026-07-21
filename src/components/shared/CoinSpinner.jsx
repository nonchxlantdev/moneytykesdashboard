import "./coin-spinner.css";

const coinSrc = `${import.meta.env.BASE_URL}coinicon.png`;

/**
 * Spinning MoneyTykes coin — shared loading indicator.
 * @param {{ size?: number, label?: string, className?: string }} props
 */
export default function CoinSpinner({ size = 56, label = "Loading", className = "" }) {
  return (
    <span
      className={`mt-coin-spinner ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{ "--coin-size": `${size}px` }}
    >
      <img src={coinSrc} alt="" aria-hidden="true" className="mt-coin-spinner-img" />
    </span>
  );
}
