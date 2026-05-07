export function getFilePathFromB2Url(url: string): string | null {
  const regex = /\/file\/[^/]+\/(.+)$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function extractFileIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Format: /files/${id}?token=${token}
  const id = url.split('/').pop()?.split('?')[0];
  return id || null;
}
