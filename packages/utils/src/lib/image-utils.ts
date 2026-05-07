const extractIdFromPath = (path?: string | null) => {
  if (!path) return null;
  const start = path.indexOf("/files/");
  if (start === -1) return null;
  const after = path.substring(start + 7); // skip '/files/'
  const endQ = after.indexOf("?");
  return endQ === -1 ? after : after.substring(0, endQ);
};

export const getAvatarInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  const first = parts[0]?.[0] ?? "";
  const lastSource = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const last = lastSource?.[0] ?? "";
  const fallback = parts[0]?.[1] ?? "";
  const combined = parts.length > 1 ? `${first}${last}` : `${first}${fallback}`;
  const initials = combined.trim();
  return initials ? initials.toUpperCase() : (first || "?").toUpperCase();
};

export default extractIdFromPath;
