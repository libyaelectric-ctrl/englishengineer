import { logger } from '../logger.js';

type AlertSeverity = 'info' | 'warning' | 'critical';

interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertRule {
  name: string;
  condition: () => boolean;
  severity: AlertSeverity;
  message: string;
  cooldownMs: number;
}

const alerts: Alert[] = [];
const alertRules: AlertRule[] = [];
const lastAlertTimes = new Map<string, number>();

/**
 * Alerting system for monitoring.
 * Evaluates rules and triggers alerts.
 */
export const createAlert = (
  severity: AlertSeverity,
  title: string,
  message: string,
  source: string
): Alert => {
  const alert: Alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    severity,
    title,
    message,
    source,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };

  alerts.push(alert);

  // Log based on severity
  switch (severity) {
    case 'critical':
      logger.e(`CRITICAL ALERT: ${title}`, { message, source });
      break;
    case 'warning':
      logger.w(`WARNING: ${title}`, { message, source });
      break;
    case 'info':
      logger.i(`INFO: ${title}`, { message, source });
      break;
  }

  return alert;
};

/**
 * Register an alert rule.
 */
export const registerAlertRule = (rule: AlertRule): void => {
  alertRules.push(rule);
  logger.i(`Alert rule registered: ${rule.name}`);
};

/**
 * Evaluate all alert rules.
 */
export const evaluateAlertRules = (): Alert[] => {
  const triggeredAlerts: Alert[] = [];

  for (const rule of alertRules) {
    const lastAlert = lastAlertTimes.get(rule.name);
    const now = Date.now();

    // Check cooldown
    if (lastAlert && now - lastAlert < rule.cooldownMs) {
      continue;
    }

    // Evaluate condition
    if (rule.condition()) {
      const alert = createAlert(rule.severity, rule.name, rule.message, 'rule-engine');
      triggeredAlerts.push(alert);
      lastAlertTimes.set(rule.name, now);
    }
  }

  return triggeredAlerts;
};

/**
 * Get all alerts.
 */
export const getAlerts = (options?: {
  severity?: AlertSeverity;
  acknowledged?: boolean;
  limit?: number;
}): Alert[] => {
  let filtered = [...alerts];

  if (options?.severity) {
    filtered = filtered.filter((a) => a.severity === options.severity);
  }

  if (options?.acknowledged !== undefined) {
    filtered = filtered.filter((a) => a.acknowledged === options.acknowledged);
  }

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
};

/**
 * Acknowledge an alert.
 */
export const acknowledgeAlert = (alertId: string): boolean => {
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
};

/**
 * Get alert statistics.
 */
export const getAlertStats = (): {
  total: number;
  critical: number;
  warning: number;
  info: number;
  unacknowledged: number;
} => {
  let critical = 0;
  let warning = 0;
  let info = 0;
  let unacknowledged = 0;

  for (const alert of alerts) {
    switch (alert.severity) {
      case 'critical':
        critical++;
        break;
      case 'warning':
        warning++;
        break;
      case 'info':
        info++;
        break;
    }

    if (!alert.acknowledged) {
      unacknowledged++;
    }
  }

  return {
    total: alerts.length,
    critical,
    warning,
    info,
    unacknowledged,
  };
};

// Default alert rules
export const registerDefaultAlertRules = (): void => {
  // High memory usage
  registerAlertRule({
    name: 'high_memory_usage',
    condition: () => {
      const mem = process.memoryUsage();
      return mem.heapUsed / mem.heapTotal > 0.9;
    },
    severity: 'warning',
    message: 'Memory usage exceeds 90%',
    cooldownMs: 300000, // 5 minutes
  });

  // High error rate
  registerAlertRule({
    name: 'high_error_rate',
    condition: () => {
      // Check if error count is high
      return false; // Placeholder
    },
    severity: 'critical',
    message: 'Error rate exceeds threshold',
    cooldownMs: 600000, // 10 minutes
  });

  logger.i('Default alert rules registered');
};
