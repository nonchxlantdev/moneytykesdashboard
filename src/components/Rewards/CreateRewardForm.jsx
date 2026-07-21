import { Gift } from "lucide-react";
import DropdownSearch from "../ui/DropdownSearch";
import IconPicker from "./IconPicker";
import PointStepper from "./PointStepper";
import { REWARD_CATEGORIES } from "./rewardsUtils";

const CATEGORY_OPTIONS = REWARD_CATEGORIES.filter(c => c !== "All").map(category => ({
  id: category,
  label: category,
  textValue: category
}));

export default function CreateRewardForm({ value, onChange, onSubmit, editingId, onCancelEdit }) {
  return (
    <form
      className="rw-card rw-create-form"
      onSubmit={event => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="rw-card-head">
        <h2>{editingId ? "Edit reward" : "Create reward"}</h2>
      </div>

      <label className="rw-field">
        <span>Reward Name</span>
        <input
          type="text"
          value={value.name}
          placeholder='e.g. "Star Student"'
          onChange={event => onChange({ ...value, name: event.target.value })}
          required
        />
      </label>

      <div className="rw-field">
        <span>Point Value</span>
        <PointStepper
          value={value.pointValue}
          onChange={points => onChange({ ...value, pointValue: points })}
        />
      </div>

      <div className="rw-field">
        <span>Icon / Badge</span>
        <IconPicker value={value.icon} onChange={icon => onChange({ ...value, icon })} />
      </div>

      <div className="rw-field">
        <DropdownSearch
          label="Category"
          placeholder="Select category…"
          searchPlaceholder="Search categories"
          emptyText="No categories found"
          items={CATEGORY_OPTIONS}
          selectedKey={value.category || null}
          onSelectionChange={key => onChange({ ...value, category: key || "Behaviour" })}
          allowClear={false}
        />
      </div>

      <label className="rw-field">
        <span>
          Description <em className="rw-optional">(optional)</em>
        </span>
        <input
          type="text"
          value={value.description}
          placeholder="Short description"
          onChange={event => onChange({ ...value, description: event.target.value })}
        />
      </label>

      <div className="rw-form-actions">
        {editingId ? (
          <button type="button" className="btn" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="btn primary-gold">
          <Gift size={15} />
          {editingId ? "Save Changes" : "Add to Rewards Bank"}
        </button>
      </div>
    </form>
  );
}
