type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  [key: string]: unknown;
}

/**
 * Formats log as single-line JSON for structured logging.
 */
function formatLog(level: LogLevel, event: string, payload?: LogPayload): string {
  const logEntry = {
    level,
    event,
    ts: new Date().toISOString(),
    ...payload,
  };
  return JSON.stringify(logEntry);
}

export const logger = {
  /**
   * Logs an info-level event.
   */
  logInfo: (eventName: string, payload?: LogPayload) => {
    // eslint-disable-next-line no-console
    console.log(formatLog("info", eventName, payload));
  },

  /**
   * Logs a warning-level event.
   */
  logWarn: (eventName: string, payload?: LogPayload) => {
    console.warn(formatLog("warn", eventName, payload));
  },

  /**
   * Logs an error-level event.
   */
  logError: (eventName: string, payload?: LogPayload, err?: Error | unknown) => {
    const errorPayload: LogPayload = { ...payload };
    
    if (err instanceof Error) {
      errorPayload.error = err.message;
      errorPayload.stack = err.stack;
    } else if (err !== undefined) {
      errorPayload.error = String(err);
    }

    console.error(formatLog("error", eventName, errorPayload));
  },

  /**
   * Logs a debug-level event (only in development).
   */
  logDebug: (eventName: string, payload?: LogPayload) => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug(formatLog("debug", eventName, payload));
    }
  },
};
