import { useState } from "react";
import { BarChart3, Check, Lock, Mail } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const assetPath = path => `${import.meta.env.BASE_URL}${path}`;

/**
 * Financial Zone coming soon placeholder with optional email capture.
 * @param {{ setToast: (msg: string) => void }} props
 */
export default function FinancialZonePage({ setToast }) {
  const [notifyEmails, setNotifyEmails] = useLocalStorage("financial_zone_notify_emails", []);
  const [email, setEmail] = useState("");

  function submitEmail(event) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setToast("Please enter a valid email address.");
      return;
    }
    if (notifyEmails.includes(trimmed)) {
      setToast("You're already on the notify list.");
      return;
    }
    setNotifyEmails(current => [...current, trimmed]);
    setEmail("");
    setToast("Thanks! We'll notify you when Financial Zone launches.");
  }

  return (
    <section className="financial-zone-coming-soon">
      <div className="financial-zone-card">
        <div className="financial-zone-icon" aria-hidden="true">
          <BarChart3 size={42} />
          <Lock size={18} className="financial-zone-lock" />
        </div>
        <img className="financial-zone-logo" src={assetPath("Logo.png")} alt="MoneyTykes" />
        <h2>Financial Zone — Coming Soon</h2>
        <p>
          We're building something amazing. Stay tuned for financial literacy tools, budgeting games, and more.
        </p>
        <form className="financial-zone-notify" onSubmit={submitEmail}>
          <label className="field-label" htmlFor="financial-zone-email">
            Notify me when it launches
          </label>
          <div className="financial-zone-notify-row">
            <span className="input-with-icon">
              <Mail size={16} />
              <input
                id="financial-zone-email"
                type="email"
                value={email}
                placeholder="you@school.edu"
                onChange={event => setEmail(event.target.value)}
              />
            </span>
            <button className="primary-action teal-action" type="submit">
              <Check size={16} /> Notify Me
            </button>
          </div>
        </form>
        {notifyEmails.length > 0 && (
          <p className="financial-zone-saved">{notifyEmails.length} teacher{notifyEmails.length === 1 ? "" : "s"} on the waitlist.</p>
        )}
      </div>
    </section>
  );
}
