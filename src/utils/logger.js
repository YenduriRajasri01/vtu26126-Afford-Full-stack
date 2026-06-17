/**
 * Logging Middleware Utility
 * Formats and outputs structured logs for system actions, API calls, and custom heap execution.
 */
export const logger = {
  log: (moduleName, action, details = {}) => {
    console.log(
      `%c[PulseNotify Log]%c[${new Date().toISOString()}]%c[${moduleName}] %c${action}`,
      'color: #0a66c2; font-weight: bold;',
      'color: #64748b;',
      'color: #0d9488; font-weight: 600;',
      'color: #1e293b;',
      details
    );
  },
  error: (moduleName, action, error = null) => {
    console.error(
      `%c[PulseNotify Error]%c[${new Date().toISOString()}]%c[${moduleName}] %c${action}`,
      'color: #dc2626; font-weight: bold;',
      'color: #64748b;',
      'color: #dc2626; font-weight: 600;',
      'color: #b91c1c; font-weight: bold;',
      error
    );
  },
  warn: (moduleName, action, details = {}) => {
    console.warn(
      `%c[PulseNotify Warning]%c[${new Date().toISOString()}]%c[${moduleName}] %c${action}`,
      'color: #d97706; font-weight: bold;',
      'color: #64748b;',
      'color: #d97706; font-weight: 600;',
      'color: #1e293b;',
      details
    );
  }
};

export default logger;
