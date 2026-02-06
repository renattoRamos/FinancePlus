import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from '@/components/ui/clay-card';

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryBreakdownChartProps {
  data: CategoryData[];
  year: string;
}

// Colors derived from the primary theme color for a cohesive look
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--accent))',
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const CategoryBreakdownChart = ({ data, year }: CategoryBreakdownChartProps) => {
  return (
    <ClayCard>
      <ClayCardHeader>
        <ClayCardTitle>Gastos por Categoria ({year})</ClayCardTitle>
      </ClayCardHeader>
      <ClayCardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <defs>
                <filter id="shadowPie" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="hsl(var(--foreground))" floodOpacity="0.15" />
                </filter>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-clay-medium)',
                }}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={50}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                style={{ filter: 'url(#shadowPie)' }}
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};