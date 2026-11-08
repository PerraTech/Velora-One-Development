// Uitsluitend demo-authenticatie, ook in de online productiebuild: geen beveiliging.
// Deze fictieve credentials staan bewust in de frontend. Scherm toegang tot de
// Netlify-site afzonderlijk af via Netlify Visitor Access; deze code doet dat niet.
export type MockAccount = { email: string; role: "Administrator" | "Developer" };

const sessionKey = "velora.local-account";
// Behoud dezelfde demoaccounts en exacte wachtwoordcontrole in alle builds.
const accounts: (MockAccount & { password: string })[] = [
  { email: "admin@velora.com", password: "Velora@Admin2026!", role: "Administrator" },
  { email: "developer@velora.com", password: "Velora@Dev2026!", role: "Developer" },
];

export function signInMock(email: string, password: string): MockAccount | null {
  const account = accounts.find(account => account.email === email && account.password === password);
  if (!account) return null;
  // Bewaar nooit het wachtwoord; deze aanpasbare browseropslag is geen sessiebeveiliging.
  sessionStorage.setItem(sessionKey, account.email);
  return { email: account.email, role: account.role };
}

export function readMockAccount(): MockAccount | null {
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
