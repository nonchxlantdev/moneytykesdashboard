export default function RewardsTabs({ active, onChange }) {
  const tabs = [
    { id: "manage", label: "Manage Rewards" },
    { id: "award", label: "Award & Track" }
  ];

  return (
    <div className="rw-tabs" role="tablist" aria-label="Rewards sections">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`rw-tab ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
