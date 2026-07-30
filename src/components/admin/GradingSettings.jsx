import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import {
  defaultCategories,
  defaultLetterScale,
  getCategoriesForSchool,
  getLetterScaleForSchool,
  saveCategoriesForSchool,
  saveLetterScaleForSchool
} from "../../utils/gradesStorage";

function newTempId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function GradingSettings({ schools = [] }) {
  const schoolOptions = schools.length ? schools : [{ id: "default", name: "Default school" }];
  const [schoolId, setSchoolId] = useState(String(schoolOptions[0]?.id ?? "default"));
  const school = schoolOptions.find(item => String(item.id) === String(schoolId)) || schoolOptions[0];
  const [categories, setCategories] = useState(() => getCategoriesForSchool(school?.id));
  const [letterScale, setLetterScale] = useState(() => getLetterScaleForSchool(school?.id));
  const [savedNote, setSavedNote] = useState("");
  const [error, setError] = useState("");

  const weightTotal = useMemo(
    () => Math.round(categories.reduce((sum, row) => sum + (Number(row.weight) || 0), 0) * 10) / 10,
    [categories]
  );
  const weightsValid = Math.abs(weightTotal - 100) < 0.05;

  function loadSchool(nextId) {
    const nextSchool = schoolOptions.find(item => String(item.id) === String(nextId)) || schoolOptions[0];
    setSchoolId(String(nextId));
    setCategories(getCategoriesForSchool(nextSchool?.id));
    setLetterScale(getLetterScaleForSchool(nextSchool?.id));
    setSavedNote("");
    setError("");
  }

  function updateCategory(index, patch) {
    setCategories(current => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function moveCategory(index, delta) {
    setCategories(current => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next.map((item, order) => ({ ...item, order }));
    });
  }

  function save() {
    if (!weightsValid) {
      setError("Category weights must sum to 100 before saving.");
      setSavedNote("");
      return;
    }
    if (!letterScale.length) {
      setError("Add at least one letter grade cutoff.");
      setSavedNote("");
      return;
    }
    saveCategoriesForSchool(school?.id, categories);
    saveLetterScaleForSchool(school?.id, letterScale);
    setError("");
    setSavedNote("Grading settings saved for this school.");
  }

  return (
    <div className="gr-settings" data-tour="admin-grading">
      <div className="gr-settings-head">
        <div>
          <h3>Grading</h3>
          <p>Set category weights, drop-lowest rules, and letter-grade cutoffs used by the Grades gradebook.</p>
        </div>
        <label className="rc-inline-field" title="Choose which school’s grading settings to edit">
          School
          <select value={schoolId} onChange={event => loadSchool(event.target.value)}>
            {schoolOptions.map(item => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rc-subjects-head">
        <strong>Categories</strong>
        <Button
          color="secondary"
          size="sm"
          iconLeading={<Plus data-icon />}
          title="Add a grading category"
          onClick={() =>
            setCategories(current => [
              ...current,
              {
                id: newTempId("gcat"),
                schoolId: school?.id ?? null,
                name: "New category",
                weight: 0,
                dropLowest: 0,
                allowExtraCredit: false,
                order: current.length
              }
            ])
          }
        >
          Add category
        </Button>
      </div>

      <div className="gr-cat-row gr-cat-row--head" aria-hidden="true">
        <span>Category</span>
        <span>Weight</span>
        <span>Drop lowest</span>
        <span />
      </div>

      {categories.map((category, index) => (
        <div className="gr-cat-row" key={category.id}>
          <input
            value={category.name}
            title="Category name"
            onChange={event => updateCategory(index, { name: event.target.value })}
            placeholder="Category"
          />
          <div className="gr-suffix-field">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={category.weight ?? 0}
              title="Weight percent"
              onChange={event => updateCategory(index, { weight: Number(event.target.value) || 0 })}
              placeholder="Weight"
            />
            <span>%</span>
          </div>
          <input
            type="number"
            min="0"
            step="1"
            value={category.dropLowest ?? 0}
            title="Drop lowest N scores in this category"
            onChange={event => updateCategory(index, { dropLowest: Math.max(0, Number(event.target.value) || 0) })}
            placeholder="Drop"
          />
          <div className="gr-cat-row-actions">
            <Button
              color="tertiary"
              size="sm"
              isDisabled={index === 0}
              iconLeading={ArrowUp}
              title="Move up"
              aria-label={`Move ${category.name} up`}
              onClick={() => moveCategory(index, -1)}
            />
            <Button
              color="tertiary"
              size="sm"
              isDisabled={index === categories.length - 1}
              iconLeading={ArrowDown}
              title="Move down"
              aria-label={`Move ${category.name} down`}
              onClick={() => moveCategory(index, 1)}
            />
            <Button
              color="tertiary-destructive"
              size="sm"
              iconLeading={Trash2}
              title="Remove category"
              aria-label={`Remove ${category.name}`}
              onClick={() => setCategories(current => current.filter((_, i) => i !== index))}
            />
          </div>
        </div>
      ))}

      <p className={`gr-weight-total ${weightsValid ? "is-valid" : "is-invalid"}`}>
        Weight total: {weightTotal}% {weightsValid ? "✓" : "(must equal 100)"}
      </p>

      <div className="rc-subjects-head">
        <strong>Letter grade cutoffs</strong>
        <Button
          color="secondary"
          size="sm"
          iconLeading={<Plus data-icon />}
          onClick={() =>
            setLetterScale(current => [...current, { minPercent: 0, letter: "F" }])
          }
        >
          Add cutoff
        </Button>
      </div>

      {letterScale.map((row, index) => (
        <div className="gr-letter-row" key={`${row.letter}-${index}`}>
          <div className="gr-suffix-field">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={row.minPercent ?? 0}
              title="Minimum percent for this letter"
              onChange={event => {
                const next = letterScale.map((item, i) =>
                  i === index ? { ...item, minPercent: Number(event.target.value) || 0 } : item
                );
                setLetterScale(next);
              }}
              placeholder="Min %"
            />
            <span>%</span>
          </div>
          <input
            value={row.letter || ""}
            title="Letter grade"
            onChange={event => {
              const next = letterScale.map((item, i) =>
                i === index ? { ...item, letter: event.target.value } : item
              );
              setLetterScale(next);
            }}
            placeholder="Letter"
          />
          <Button
            color="tertiary-destructive"
            size="sm"
            iconLeading={Trash2}
            title="Remove cutoff"
            aria-label={`Remove ${row.letter || "letter"} cutoff`}
            onClick={() => setLetterScale(current => current.filter((_, i) => i !== index))}
          />
        </div>
      ))}

      <div className="gr-settings-actions">
        <Button
          color="secondary"
          size="md"
          iconLeading={RotateCcw}
          onClick={() => {
            setCategories(defaultCategories(school?.id));
            setLetterScale(defaultLetterScale());
            setSavedNote("");
            setError("");
          }}
        >
          Reset defaults
        </Button>
        <Button color="primary" size="md" onClick={save}>
          Save grading settings
        </Button>
      </div>
      {error ? <p className="gr-error">{error}</p> : null}
      {savedNote ? <p className="rc-saved">{savedNote}</p> : null}
    </div>
  );
}
