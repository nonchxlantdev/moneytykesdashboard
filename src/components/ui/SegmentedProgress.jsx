/**
 * Segmented progress summary — horizontal % / count metrics.
 * @param {{
 *   title?: string,
 *   segments: Array<{
 *     label: string,
 *     value: number|string,
 *     meta?: string,
 *     tone?: 'success'|'pending'|'danger'|'info'|'primary'|'achieve'|'rose'|'violet',
 *     percent?: number
 *   }>,
 *   className?: string,
 * }} props
 */
export default function SegmentedProgress({ title, segments = [], className = "" }) {
  return (
    <article className={`mt-segmented-card ${className}`.trim()}>
      {title ? <h3 className="mt-segmented-title">{title}</h3> : null}
      <div className={`mt-segmented-grid cols-${Math.min(segments.length, 4)}`}>
        {segments.map(segment => {
          const pct = typeof segment.percent === "number" ? Math.max(0, Math.min(100, segment.percent)) : null;
          return (
            <div className="mt-segment" key={segment.label}>
              <p className="mt-segment-label">{segment.label}</p>
              <p className={`mt-segment-value tone-${segment.tone || "primary"}`}>{segment.value}</p>
              {segment.meta ? <p className="mt-segment-meta">{segment.meta}</p> : null}
              {pct !== null && (
                <div className="mt-progress mt-progress-sm" aria-hidden="true">
                  <span className={`mt-progress-fill tone-${segment.tone || "primary"}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
