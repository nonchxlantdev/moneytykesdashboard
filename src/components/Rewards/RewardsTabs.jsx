export default function RewardsTabs({ active, onChange }) {
  const tabs = [
    { id: "manage", label: "Manage Rewards" },
    { id: "award", label: "Award & Track" }
  ];

  return (
    <div className="rw-tabs" role="tablist" aria-label="Rewards sections" data-tour="rewards-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`rw-tab ${active === tab.id ? "active" : ""}`}
          data-tour={tab.id === "manage" ? "rewards-tab-manage" : "rewards-tab-award"}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
