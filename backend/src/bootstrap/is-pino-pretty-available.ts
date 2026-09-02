// pino-pretty is a devDependency — deliberately not installed in the
// production Docker image (`npm ci --omit=dev`). Gating on whether it can
// actually be resolved, rather than on NODE_ENV === 'production', means
// the app can never crash on boot no matter what NODE_ENV is set to (or
// misspelled as, or left unset as) in a given environment: it only tries
// to load pino-pretty when the package genuinely is there. `resolve` is
// injectable so this is testable without touching node_modules.
export function isPinoPrettyAvailable(
  resolve: (id: string) => string = require.resolve,
): boolean {
  try {
    resolve('pino-pretty');
    return true;
  } catch {
    return false;
  }
}
