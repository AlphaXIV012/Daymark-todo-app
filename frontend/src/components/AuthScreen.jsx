import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, KeyRound, ListChecks, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (isRegister) {
        const response = await register(email.trim(), password);
        setMode("login");
        setPassword("");
        setNotice(response?.message || "Account created. Please sign in.");
      } else {
        await login(email.trim(), password);
      }
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
    setPassword("");
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="brand brand-on-dark">
          <span className="brand-mark"><Check size={19} strokeWidth={3} /></span>
          <span>daymark</span>
        </div>

        <div className="story-content">
          <div className="eyebrow eyebrow-dark"><Sparkles size={14} /> A calmer way to get things done</div>
          <h1>Make room for<br /><span>what matters.</span></h1>
          <p className="story-copy">
            A little more focus. A little less noise. Keep your tasks close,
            make steady progress, and finish your day with clarity.
          </p>

          <div className="story-points">
            <div><span className="point-icon"><Check size={15} /></span><span>Simple lists that stay out of your way</span></div>
            <div><span className="point-icon"><LockKeyhole size={15} /></span><span>Your tasks, private to your account</span></div>
            <div><span className="point-icon"><ListChecks size={15} /></span><span>A clear view of what is next</span></div>
          </div>
        </div>

        <div className="story-footer">Built for small steps and meaningful progress.</div>
        <div className="story-orb story-orb-one" />
        <div className="story-orb story-orb-two" />
      </section>

      <section className="auth-panel-wrap">
        <div className="auth-panel">
          <div className="mobile-brand brand">
            <span className="brand-mark"><Check size={19} strokeWidth={3} /></span>
            <span>daymark</span>
          </div>
          <div className="auth-heading">
            <div className="auth-icon"><KeyRound size={20} /></div>
            <p className="section-kicker">YOUR PERSONAL WORKSPACE</p>
            <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
            <p>{isRegister ? "Start your own space for getting things done." : "Sign in to pick up where you left off."}</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Authentication options">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Sign in</button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}>Create account</button>
          </div>

          {notice && <div className="alert alert-success" role="status">{notice}</div>}
          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Mail size={17} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="label-row">
              <label className="field-label" htmlFor="password">Password</label>
              {isRegister && <span className="field-hint">At least 12 characters</span>}
            </div>
            <div className="input-wrap">
              <LockKeyhole size={17} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "Create a strong password" : "Enter your password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isRegister ? 12 : undefined}
                required
              />
              <button className="input-action" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button className="primary-button auth-submit" type="submit" disabled={busy}>
              {busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-footnote">
            {isRegister
              ? "By creating an account, you agree to use this workspace responsibly."
              : "Your account keeps your tasks private and in sync with your workspace."}
          </p>
          <div className="auth-security"><LockKeyhole size={13} /> Secured with token-based authentication</div>
        </div>
      </section>
    </main>
  );
}
