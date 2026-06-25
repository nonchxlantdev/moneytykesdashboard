/**
 * Small status or category badge.
 * @param {{ children: React.ReactNode, tone?: 'default'|'success'|'warning'|'teal' }} props
 */
export default function Badge({ children, tone = "default" }) {
  return <span className={`mt-badge mt-badge-${tone}`}>{children}</span>;
}
