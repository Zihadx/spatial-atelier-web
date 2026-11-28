/** Minimal structured logger: one JSON line per event, never pass personal data (emails, message text) as fields. */
export type LogFields = Record<string, string | number | boolean | null | undefined>;
export interface Logger { info(event: string, fields?: LogFields): void; warn(event: string, fields?: LogFields): void; error(event: string, fields?: LogFields): void }

const emit = (level: "info" | "warn" | "error", event: string, fields?: LogFields) => {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...fields });
  (level === "error" ? console.error : level === "warn" ? console.warn : console.info)(line);
};
export const logger: Logger = { info: (e, f) => emit("info", e, f), warn: (e, f) => emit("warn", e, f), error: (e, f) => emit("error", e, f) };
export const silentLogger: Logger = { info() {}, warn() {}, error() {} };
