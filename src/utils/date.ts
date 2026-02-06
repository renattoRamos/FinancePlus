import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const TIME_ZONE = 'America/Sao_Paulo'; // Fuso horário de Brasília (UTC-3)

/**
 * Obtém a data/hora atual no fuso horário de Brasília.
 * @returns Objeto Date ajustado para UTC-3.
 */
export const getBrazilTime = (): Date => {
  return toZonedTime(new Date(), TIME_ZONE);
};

/**
 * Formata uma string de data (YYYY-MM-DD) para o formato brasileiro (dd/MM/yyyy).
 * @param dateString Data no formato ISO (YYYY-MM-DD).
 * @returns Data formatada.
 */
export const formatBrazilDate = (dateString: string): string => {
  try {
    // parseISO trata a string YYYY-MM-DD como data local (sem fuso horário)
    const date = parseISO(dateString);
    // Formata para o padrão brasileiro
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (e) {
    console.error("Erro ao formatar data:", dateString, e);
    return dateString;
  }
};

/**
 * Converte uma data de vencimento (dia do mês) e uma chave de mês (Ex: 'Novembro de 2025')
 * para uma string YYYY-MM-DD, garantindo que o dia seja preservado.
 * Esta função é usada para salvar no banco de dados (coluna DATE).
 * @param monthKey Chave do mês.
 * @param day Dia do mês.
 * @returns String YYYY-MM-DD.
 */
export const getDbDateString = (monthKey: string, day: string): string | null => {
  const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const dayNum = parseInt(day);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return null;
  
  const [monthName, yearStr] = monthKey.split(" de ");
  const monthIndex = MONTHS.indexOf(monthName);
  const year = parseInt(yearStr);
  
  if (monthIndex === -1 || isNaN(year)) return null;

  // Cria a data usando UTC para garantir que o dia seja o dia selecionado,
  // evitando o recuo de fuso horário local.
  const date = new Date(Date.UTC(year, monthIndex, dayNum));
  
  const yearFormatted = date.getUTCFullYear();
  const monthFormatted = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dayFormatted = String(date.getUTCDate()).padStart(2, '0');
  
  return `${yearFormatted}-${monthFormatted}-${dayFormatted}`;
};