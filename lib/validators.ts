export function validateUsername(username: string): string | null {
  if (!username || username.length < 3 || username.length > 30) {
    return "Username must be 3-30 characters";
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Username can only contain lowercase letters, numbers, and underscores";
  }
  const reserved = [
    "admin",
    "api",
    "dashboard",
    "login",
    "register",
    "settings",
    "analytics",
    "pricing",
    "privacy",
    "terms",
    "onboarding",
    "sign-in",
    "sign-up",
  ];
  if (reserved.includes(username)) {
    return "This username is reserved";
  }
  return null;
}

export function sanitizeText(input: string, max = 500): string {
  return input.trim().slice(0, max);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
