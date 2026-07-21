import { REWARD_ICONS, iconBgFor } from "./rewardsUtils";

export default function IconPicker({ value, onChange }) {
  return (
    <div className="rw-icon-picker" role="group" aria-label="Choose reward icon">
      {REWARD_ICONS.map(icon => (
        <button
          key={icon}
          type="button"
          className={`rw-icon-choice ${value === icon ? "selected" : ""}`}
          style={{ background: iconBgFor(icon) }}
          onClick={() => onChange(icon)}
          aria-label={`Select ${icon}`}
          aria-pressed={value === icon}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
