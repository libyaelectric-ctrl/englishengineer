import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface AIMetrics {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
  avgLatency: number;
}

export const AIAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from /api/admin/ai-metrics
    const mockMetrics: AIMetrics = {
      totalRequests: 156,
      totalTokens: 45200,
      totalCost: 12.85,
      successRate: 98.5,
      avgLatency: 1250,
    };
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />;
  }

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <MetricCard
        icon={<Activity className="h-5 w-5" />}
        label="Total Requests"
        value={metrics.totalRequests.toLocaleString()}
        color="blue"
      />
      <MetricCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Tokens Used"
        value={(metrics.totalTokens / 1000).toFixed(1) + 'K'}
        color="green"
      />
      <MetricCard
        icon={<DollarSign className="h-5 w-5" />}
        label="Total Cost"
        value={'$' + metrics.totalCost.toFixed(2)}
        color="purple"
      />
      <MetricCard
        icon={<Clock className="h-5 w-5" />}
        label="Avg Latency"
        value={metrics.avgLatency + 'ms'}
        color="orange"
      />
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <div className={`rounded p-1 ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
};
