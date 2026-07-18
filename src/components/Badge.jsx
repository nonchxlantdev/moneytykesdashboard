/**
 * Status / type badge — maps to the fixed v2 status palette.
 * @param {{
 *   children: React.ReactNode,
 *   tone?: 'default'|'neutral'|'teal'|'info'|'success'|'published'|'completed'|'present'|'warning'|'pending'|'late'|'danger'|'error'|'absent'|'inactive'|'achieve'|'reward',
 *   className?: string,
 * }} props
 */
export default function Badge({ children, tone = "default", className = "" }) {
  return <span className={`mt-badge mt-badge-${tone} ${className}`.trim()}>{children}</span>;
}
