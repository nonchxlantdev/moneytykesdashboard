import { useMemo, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import Select from "../ui/Select";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddGradeItemModal({ categories = [], students = [], onClose, onSave }) {
  const firstCategory = categories.find(cat => (Number(cat.weight) || 0) > 0) || categories[0];
  const [form, setForm] = useState({
    title: "",
    categoryId: String(firstCategory?.id || ""),
    date: todayIso(),
    entryMode: "points",
    maxPoints: 100,
    isGroup: false,
    groupStudentIds: []
  });
  const [error, setError] = useState("");

  const categoryOptions = useMemo(
    () =>
      [...categories]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(category => ({
          value: String(category.id),
          label: `${category.name} (${category.weight || 0}%)`
        })),
    [categories]
  );

  function toggleStudent(id) {
    setForm(current => {
      const set = new Set(current.groupStudentIds.map(String));
      const key = String(id);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...current, groupStudentIds: [...set] };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("Enter a title for this grade item.");
      return;
    }
    if (!form.categoryId) {
      setError("Choose a category.");
      return;
    }
    if (form.entryMode === "points" && !(Number(form.maxPoints) > 0)) {
      setError("Max points must be greater than 0.");
      return;
    }
    if (form.isGroup && !form.groupStudentIds.length) {
      setError("Select at least one student for the group project.");
      return;
    }
    onSave?.({
      title,
      categoryId: form.categoryId,
      date: form.date || todayIso(),
      entryMode: form.entryMode,
      maxPoints: form.entryMode === "points" ? Number(form.maxPoints) : null,
      isGroup: form.isGroup,
      groupStudentIds: form.isGroup ? form.groupStudentIds : []
    });
  }

  return (
    <div className="gr-modal-backdrop" role="presentation" onClick={onClose}>
      <form
        className="gr-modal form-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gr-add-item-title"
        onClick={event => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <header className="gr-modal-head">
          <div>
            <h2 id="gr-add-item-title">Add grade item</h2>
            <p>Quizzes, tests, assignments, exams, or group projects for this class and subject.</p>
          </div>
          <Button color="secondary" size="md" type="button" onClick={onClose}>
            Close
          </Button>
        </header>

        <div className="gr-modal-grid">
          <label>
            Title
            <input
              autoFocus
              value={form.title}
              onChange={event => setForm({ ...form, title: event.target.value })}
              placeholder="e.g. Midterm Test"
            />
          </label>

          <Select
            label="Category"
            value={form.categoryId}
            onChange={value => setForm(current => ({ ...current, categoryId: String(value || "") }))}
            options={categoryOptions}
            placeholder="Select category"
            searchPlaceholder="Search categories"
            required
            allowClear={false}
          />

          <label>
            Date
            <input type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} />
          </label>

          <Select
            label="Entry mode"
            value={form.entryMode}
            onChange={value => setForm(current => ({ ...current, entryMode: String(value || "points") }))}
            options={[
              { value: "points", label: "Points" },
              { value: "percent", label: "Percent" }
            ]}
            placeholder="Select mode"
            searchPlaceholder="Search"
            required
            allowClear={false}
          />

          {form.entryMode === "points" ? (
            <label>
              Max points
              <input
                type="number"
                min="1"
                step="0.1"
                value={form.maxPoints}
                onChange={event => setForm({ ...form, maxPoints: event.target.value })}
              />
            </label>
          ) : null}
        </div>

        <label className="gr-check">
          <input
            type="checkbox"
            checked={form.isGroup}
            onChange={event => setForm({ ...form, isGroup: event.target.checked })}
          />
          Group project (score once for selected students)
        </label>

        {form.isGroup ? (
          <div className="gr-group-list">
            <strong>Group members</strong>
            <div className="gr-group-options">
              {students.map(student => {
                const label = `${student.first || ""} ${student.last || ""}`.trim();
                const checked = form.groupStudentIds.map(String).includes(String(student.id));
                return (
                  <label key={student.id} className="gr-check">
                    <input type="checkbox" checked={checked} onChange={() => toggleStudent(student.id)} />
                    {label || "Student"}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {error ? <p className="gr-error">{error}</p> : null}

        <div className="gr-modal-actions">
          <Button color="secondary" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" size="md" type="submit">
            Save item
          </Button>
        </div>
      </form>
    </div>
  );
}
