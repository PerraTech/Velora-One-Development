"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, UserRound, KeyRound, LoaderCircle } from "lucide-react";
import { signInMock } from "@/lib/mock-login";

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>();
  const submittingRef = useRef(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setLoginError(undefined);
    const username = usernameRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";
    const next = { username: username ? undefined : "Vul je gebruikersnaam of e-mailadres in.", password: password?.trim() ? undefined : "Vul je wachtwoord in." };
    setErrors(next);
    if (next.username) { usernameRef.current?.focus(); return; }
    if (next.password) { passwordRef.current?.focus(); return; }
    submittingRef.current = true;
    setLoading(true);
    try {
      // Simuleer lokaal de wachttijd van een loginverzoek, zonder netwerkverkeer.
      await new Promise(resolve => setTimeout(resolve, 350));
      if (!signInMock(username, password)) {
        setLoginError("De gebruikersnaam of het wachtwoord is onjuist. Probeer het opnieuw.");
        passwordRef.current?.focus();
        return;
      }
      if (passwordRef.current) passwordRef.current.value = "";
      router.replace("/portal");
    } catch {
      setLoginError("Inloggen is niet gelukt. Sta sessieopslag in je browser toe en probeer opnieuw.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return <form onSubmit={submit} noValidate className="login-form" aria-busy={loading}>
    <div className="field"><label htmlFor="username">Gebruikersnaam / e-mailadres</label><div className="input-wrap"><UserRound size={17} aria-hidden="true" /><input ref={usernameRef} id="username" name="demo-username" type="text" autoComplete="off" placeholder="Jouw demogebruikersnaam" disabled={loading} aria-describedby={errors.username ? "username-error" : loginError ? "login-error" : undefined} aria-invalid={!!errors.username || !!loginError} onChange={() => { setErrors(e => ({ ...e, username: undefined })); setLoginError(undefined); }} /></div>{errors.username && <p className="field-error" id="username-error" role="alert">{errors.username}</p>}</div>
    <div className="field"><label htmlFor="password">Wachtwoord</label><div className="input-wrap"><KeyRound size={17} aria-hidden="true" /><input ref={passwordRef} id="password" name="demo-password" type={visible ? "text" : "password"} autoComplete="off" placeholder="Een fictief demowachtwoord" disabled={loading} aria-describedby={errors.password ? "password-error" : loginError ? "login-error" : undefined} aria-invalid={!!errors.password || !!loginError} onChange={() => { setErrors(e => ({ ...e, password: undefined })); setLoginError(undefined); }} /><button type="button" className="password-toggle" disabled={loading} onClick={() => setVisible(v => !v)} aria-label={visible ? "Wachtwoord verbergen" : "Wachtwoord tonen"} aria-pressed={visible}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p className="field-error" id="password-error" role="alert">{errors.password}</p>}</div>
    {loginError && <p className="field-error" id="login-error" role="alert">{loginError}</p>}
    <button type="submit" className="gold-button" disabled={loading}>{loading ? <>Bezig met inloggen <LoaderCircle className="login-spinner" size={18} aria-hidden="true" /></> : <>Inloggen <ArrowRight size={18} aria-hidden="true" /></>}</button>
  </form>;
}

