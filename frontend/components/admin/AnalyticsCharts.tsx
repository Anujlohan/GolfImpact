'use client';

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/currency';

interface AnalyticsChartsProps {
  monthlyData: { month: string; revenue: number; donations: number }[];
  charityData: { name: string; value: number }[];
}

const CLEAN_COLORS = ['#10b981', '#3b82f6', '#64748b', '#06b6d4', '#475569'];

export function AnalyticsCharts({ monthlyData, charityData }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Monthly Revenue & Grants Trend Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white">
            Monthly Revenue & Charity Grants
          </CardTitle>
          <CardDescription className="text-xs">
            Subscription volume vs. direct grants allocated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262b35" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `$${(val / 100000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), '']}
                  contentStyle={{ backgroundColor: '#0e1117', borderColor: '#262b35', borderRadius: '0.375rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Volume"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fillOpacity={0.15}
                  fill="#10b981"
                />
                <Area
                  type="monotone"
                  dataKey="donations"
                  name="Charity Grants"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  fillOpacity={0.1}
                  fill="#64748b"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charity Grants Breakdown Pie Chart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white">
            Charity Allocation Distribution
          </CardTitle>
          <CardDescription className="text-xs">
            Cumulative grants disbursed per charity partner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {charityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CLEAN_COLORS[index % CLEAN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Raised']}
                  contentStyle={{ backgroundColor: '#0e1117', borderColor: '#262b35', borderRadius: '0.375rem', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
