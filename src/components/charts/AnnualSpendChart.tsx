import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from '@/components/ui/clay-card';

interface AnnualData {
  month: string;
  total: number; // This is pending amount
  pago: number;
}

interface AnnualSpendChartProps {
  data: AnnualData[];
  year: string;
}

export const AnnualSpendChart = ({ data, year }: AnnualSpendChartProps) => {
  return (
    <ClayCard>
      <ClayCardHeader>
        <ClayCardTitle>Visão Geral Anual ({year})</ClayCardTitle>
      </ClayCardHeader>
      <ClayCardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barGap={8}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="colorPrimaryBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                </linearGradient>
                <filter id="shadowBar" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="hsl(var(--foreground))" floodOpacity="0.1" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-clay-medium)',
                }}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="pago" stackId="a" fill="url(#colorSuccess)" name="Pago" radius={[8, 8, 0, 0]} style={{ filter: 'url(#shadowBar)' }} />
              <Bar dataKey="total" stackId="a" fill="url(#colorPrimaryBar)" name="Pendente" radius={[8, 8, 0, 0]} style={{ filter: 'url(#shadowBar)' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};