import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from '@/components/ui/clay-card';

interface CardUsageData {
  name: string;
  total: number;
}

interface CardUsageChartProps {
  data: CardUsageData[];
  year: string;
}

export const CardUsageChart = ({ data, year }: CardUsageChartProps) => {
  return (
    <ClayCard>
      <ClayCardHeader>
        <ClayCardTitle>Gastos por Cartão de Crédito ({year})</ClayCardTitle>
      </ClayCardHeader>
      <ClayCardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} interval={0} />
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
              <Bar dataKey="total" name="Total Gasto" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};