// Alleen voor lokale frontendontwikkeling. Dit is geen authenticatie of beveiliging.
export type MockAccount = { email: string; role: "Administrator" | "Developer" };

const sessionKey = "velora.local-account";
export const mockLoginEnabled = process.env.NODE_ENV === "development";

// Deze fictieve accounts zijn bewust niet beschikbaar in de productiebuild.
const accounts: (MockAccount & { password: string })[] = process.env.NODE_ENV === "development" ? [
  { email: "admin@velora.com", password: "Velora@Admin2026!", role: "Administrator" },
  { email: "developer@velora.com", password: "Velora@Dev2026!", role: "Developer" },
] : [];

export function signInMock(email: string, password: string): MockAccount | null {
  const account = accounts.find(account => account.email === email && account.password === password);
  if (!account) return null;
  // Bewaar nooit het wachtwoord; deze aanpasbare browseropslag is geen sessiebeveiliging.
  sessionStorage.setItem(sessionKey, account.email);
  return { email: account.email, role: account.role };
}

export function readMockAccount(): MockAccount | null {
  if (!mockLoginEnabled) return null;
  try {
    const email = sessionStorage.getItem(sessionKey);
    const account = accounts.find(account => account.email === email);
    return account ? { email: account.email, role: account.role } : null;
  } catch {
    return null;
  }
}

export function signOutMock() {
  try {
    sessionStorage.removeItem(sessionKey);
  } catch {
    // Ook met geblokkeerde browseropslag kan de gebruiker terug naar de login.
  }
}
