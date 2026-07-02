import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SEASONS = ["Winter", "Spring", "Summer", "Fall", "All"];

/**
 * @param {{ students: Array }} props
 */
export default function PerformanceChartCard({ students }) {
  const [season, setSeason] = useState("Spring");

  const data = useMemo(() => {
    const months = season === "All"
      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      : season === "Winter"
        ? ["Dec", "Jan", "Feb"]
        : season === "Summer"
          ? ["Jun", "Jul", "Aug"]
          : season === "Fall"
            ? ["Sep", "Oct", "Nov"]
            : ["Mar", "Apr", "May"];

    const avgPoints = students.length
      ? students.reduce((sum, student) => sum + (student.totalEarned || 0), 0) / students.length
      : 0;

    return months.map((month, index) => ({
      month,
      score: Math.max(0, Math.round((avgPoints / 100) * (0.65 + index * 0.08)))
    }));
  }, [students, season]);

  return (
    <article className="dash-card performance-chart-card">
      <header className="dash-card-header performance-chart-header">
        <h3 className="dash-card-title">Performance</h3>
        <div className="performance-chart-tabs" role="tablist" aria-label="Season">
          {SEASONS.map(option => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={season === option}
              className={season === option ? "active" : ""}
              onClick={() => setSeason(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </header>
      <div className="performance-chart-wrap">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} className="performance-chart-grid" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis width={30} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
            <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: "#0ea5e9" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="dash-card-footnote">Class progress index based on total points earned.</p>
    </article>
  );
}
