export function shouldForcePathStyle(endpoint: string): boolean {
  const hostname = new URL(endpoint).hostname.toLowerCase();
  const isNeonObjectStorage =
    hostname.includes('.storage.') && hostname.endsWith('.aws.neon.tech');

  return (
    isNeonObjectStorage ||
    process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === 'true'
  );
}
