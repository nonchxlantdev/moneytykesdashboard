/**
 * @param {{ tasks: Array }} props
 */
export default function HelpRequestsCard({ tasks }) {
  const total = tasks.length;
  const open = tasks.filter(task => (task.completed || 0) < (task.assigned || 1)).length;

  return (
    <article className="dash-card help-requests-card">
      <header className="dash-card-header">
        <h3 className="dash-card-title">Help Requests</h3>
      </header>
      <div className="attendance-stat-grid">
        <div>
          <p className="dash-stat-label">Total</p>
          <p className="dash-stat-value">{total}</p>
        </div>
        <div>
          <p className="dash-stat-label">Open</p>
          <p className="dash-stat-value open">{open}</p>
        </div>
      </div>
      <p className="dash-card-footnote">Based on active class tasks and assignments.</p>
    </article>
  );
}
