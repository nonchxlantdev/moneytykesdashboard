/**
 * Inline progress bar.
 * @param {{ value: number, max?: number, tone?: 'primary'|'success'|'pending'|'danger'|'achieve'|'info'|'rose'|'violet', className?: string }} props
 */
export default function ProgressBar({ value = 0, max = 100, tone = "primary", className = "" }) {
  const pct = Math.max(0, Math.min(100, Math.round((Number(value) / (max || 100)) * 100)));
  return (
    <div className={`mt-progress ${className}`.trim()} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span className={`mt-progress-fill tone-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
