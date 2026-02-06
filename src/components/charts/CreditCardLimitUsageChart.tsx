import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClayCard, ClayCardContent, ClayCardHeader, ClayCardTitle } from '@/components/ui/clay-card';
import { Card } from '@/types/card';

interface CreditCardLimitUsageChartProps {
  data: Card[];
}

export const CreditCardLimitUsageChart = ({ data }: CreditCardLimitUsageChartProps) => {
  const chartData = data
    .filter(card => card.type === 'Crédito' && card.status === 'Ativo' && card.limit !== undefined && card.limit > 0)
    .map(card => ({
      name: card.name,
      limite: card.limit,
      utilizado: card.usedAmount || 0,
    }));

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  };

  return (
    <ClayCard>
      <ClayCardHeader>
        <ClayCardTitle>Uso do Limite de Cartão de Crédito</ClayCardTitle>
      </ClayCardHeader>
      <ClayCardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-clay-medium)',
                }}
                formatter={(value: number) => formatCurrency(value)}
                cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="limite" name="Limite Total" fill="hsl(var(--primary) / 0.6)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="utilizado" name="Valor Utilizado" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ClayCardContent>
    </ClayCard>
  );
};