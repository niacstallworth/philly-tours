import { builderAdminCredentials } from "../data/builderAdminCredentials";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isBuilderEmailAllowed(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return builderAdminCredentials.some((entry) => entry.email === normalizedEmail);
}

export function validateBuilderCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedPassword = password.trim();

  if (!normalizedEmail || !trimmedPassword) {
    return {
      ok: false as const,
      error: "Builder mode requires an approved admin email and password."
    };
  }

  const match = builderAdminCredentials.find((entry) => entry.email === normalizedEmail);
  if (!match) {
    return {
      ok: false as const,
      error: "This email is not approved for Builder mode."
    };
  }

  if (match.password !== trimmedPassword) {
    return {
      ok: false as const,
      error: "That builder password is incorrect."
    };
  }

  return {
    ok: true as const,
    admin: match
  };
}
