/** Utilitários de download sem dependência do Supabase. */

function toBuffer(buffer: Buffer | Uint8Array | ArrayBuffer): Buffer {
  if (Buffer.isBuffer(buffer)) return buffer;
  if (buffer instanceof ArrayBuffer) return Buffer.from(new Uint8Array(buffer));
  return Buffer.from(buffer);
}

export function toDataUrl(
  contentType: string,
  buffer: Buffer | Uint8Array | ArrayBuffer
): string {
  const bytes = toBuffer(buffer);
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}
