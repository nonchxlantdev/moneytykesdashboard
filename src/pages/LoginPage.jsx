import React, { useState } from "react";
import { Heart, Lock, Mail } from "lucide-react";
import "./LoginPage.css";

const teachersDashboardLogo = `${import.meta.env.BASE_URL}assets/teachersdashboardpng.png`;
const moneyTykesLogo = `${import.meta.env.BASE_URL}Logo.png`;

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  return (
    <main className="mt-login-page">
      <div className="mt-login-stage">
        <section className="mt-login-form-panel" aria-label="Teacher login">
          {children}
        </section>
      </div>
      <aside className="mt-login-brand-panel" aria-label="MoneyTykes">
        <img className="mt-login-brand-logo" src={moneyTykesLogo} alt="MoneyTykes" />
      </aside>
      <footer className="mt-login-footer">
        <span>&copy; 2026 MoneyTykes. All rights reserved.</span>
        <span className="mt-login-footer-divider" aria-hidden="true"></span>
        <span className="mt-login-powered">
          <Heart aria-hidden="true" />
          Powered by Parents
        </span>
      </footer>
    </main>
  );
}

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
  }

  function validateForm() {
    const nextErrors = {};
    const email = form.email.trim();

    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Please enter your password.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleLogin(values) {
    console.log("MoneyTykes login submitted", values);
    // TODO: Connect this placeholder to the teacher dashboard authentication flow.
    window.location.href = import.meta.env.BASE_URL;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    handleLogin({ ...form, email: form.email.trim() });
  }

  return (
    <article className="mt-login-card">
      <img className="mt-login-dashboard-logo" src={teachersDashboardLogo} alt="Teachers Dashboard" />

      <div className="mt-login-card-heading">
        <h1>Welcome back</h1>
        <p className="mt-login-eyebrow">Sign in to your dashboard</p>
      </div>

      <form className="mt-login-form" onSubmit={handleSubmit} noValidate>
        <div className="mt-field-group">
          <label htmlFor="mt-login-email">Email</label>
          <div className={`mt-input-shell ${errors.email ? "mt-input-error" : ""}`}>
            <Mail aria-hidden="true" />
            <input
              id="mt-login-email"
              name="email"
              type="email"
              value={form.email}
              onChange={event => updateField("email", event.target.value)}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "mt-login-email-error" : undefined}
              placeholder="teacher@school.edu"
            />
          </div>
          {errors.email && <p className="mt-error-message" id="mt-login-email-error">{errors.email}</p>}
        </div>

        <div className="mt-field-group">
          <label htmlFor="mt-login-password">Password</label>
          <div className={`mt-input-shell ${errors.password ? "mt-input-error" : ""}`}>
            <Lock aria-hidden="true" />
            <input
              id="mt-login-password"
              name="password"
              type="password"
              value={form.password}
              onChange={event => updateField("password", event.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "mt-login-password-error" : undefined}
              placeholder="Enter your password"
            />
          </div>
          {errors.password && <p className="mt-error-message" id="mt-login-password-error">{errors.password}</p>}
        </div>

        <div className="mt-login-options">
          <label className="mt-remember-control">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={event => updateField("rememberMe", event.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <a href="#forgot-password">Forgot password?</a>
        </div>

        <button className="mt-login-submit" type="submit">Log In</button>
      </form>

      <p className="mt-access-note">Need access? Contact your school administrator.</p>
    </article>
  );
}
