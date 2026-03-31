type LogLevel = "debug" | "info" | "warn" | "error";

export type AntigravityLogger = {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): AntigravityLogger;
};

function emit(level: LogLevel, message: string, meta: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

class JsonLogger implements AntigravityLogger {
  constructor(private readonly bindings: Record<string, unknown> = {}) {}

  debug(message: string, meta: Record<string, unknown> = {}) {
    emit("debug", message, { ...this.bindings, ...meta });
  }

  info(message: string, meta: Record<string, unknown> = {}) {
    emit("info", message, { ...this.bindings, ...meta });
  }

  warn(message: string, meta: Record<string, unknown> = {}) {
    emit("warn", message, { ...this.bindings, ...meta });
  }

  error(message: string, meta: Record<string, unknown> = {}) {
    emit("error", message, { ...this.bindings, ...meta });
  }

  child(bindings: Record<string, unknown>) {
    return new JsonLogger({ ...this.bindings, ...bindings });
  }
}

export function createAntigravityLogger(bindings: Record<string, unknown> = {}): AntigravityLogger {
  return new JsonLogger(bindings);
}
