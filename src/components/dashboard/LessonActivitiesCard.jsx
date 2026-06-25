import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { CREATED_LESSONS_KEY } from "../../utils/lessonsStorage";
import { ICON_STROKE } from "../../config/navigation";

/**
 * @param {{ onNavigate: () => void }} props
 */
export default function LessonActivitiesCard({ onNavigate }) {
  const [lessons] = useLocalStorage(CREATED_LESSONS_KEY, []);

  const stats = useMemo(() => {
    const completed = lessons.filter(lesson => lesson.status === "Completed").length;
    const inProgress = lessons.filter(lesson => lesson.status === "Published").length;
    const notStarted = lessons.filter(lesson => lesson.status === "Draft").length;
    const total = Math.max(lessons.length, 1);
    return { completed, inProgress, notStarted, total: lessons.length };
  }, [lessons]);

  const chartData = [
    { name: "Not Started", value: stats.notStarted || 0, color: "#64748b" },
    { name: "Completed", value: stats.completed || 0, color: "#10b981" },
    { name: "In Progress", value: stats.inProgress || 0, color: "#f59e0b" }
  ];

  return (
    <article className="dash-card lesson-activities-card">
      <header className="dash-card-header">
        <div className="dash-card-title-wrap">
          <IconPlayerPlay size={18} stroke={ICON_STROKE} />
          <h3 className="dash-card-title">Lesson Activities</h3>
        </div>
      </header>
      <div className="lesson-activities-body">
        <ul className="lesson-activities-legend">
          {chartData.map(item => (
            <li key={item.name}>
              <span className="legend-dot" style={{ background: item.color }} />
              <span className="dash-stat-label">{item.name}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>
        <div className="lesson-activities-chart-wrap">
          <div className="lesson-activities-chart" aria-hidden={!stats.total}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={54}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="lesson-activities-center">
              <strong>{stats.total}</strong>
              <span>Lessons</span>
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="link-button dash-card-link" onClick={onNavigate}>Open lessons library</button>
    </article>
  );
}
