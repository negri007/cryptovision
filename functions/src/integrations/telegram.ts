import axios from 'axios';
import * as logger from 'firebase-functions/logger';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const isMockMode = () => !TELEGRAM_BOT_TOKEN && process.env.FUNCTIONS_EMULATOR === 'true';

export async function sendMessage(chatId: string, text: string): Promise<boolean> {
  if (isMockMode()) {
    logger.info(`Telegram Mock: Sending to ChatID [${chatId}]: "${text}"`);
    return true;
  }

  try {
    const response = await axios.post(`${BASE_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    });
    return response.data.ok === true;
  } catch (error: any) {
    logger.error(`Telegram: Failed to send message to ${chatId}`, { error: error.message });
    return false;
  }
}

export async function sendAlertNotification(chatId: string, alert: any, currentValue: number): Promise<boolean> {
  const symbol = alert.symbol || alert.ticker || 'Asset';
  const condition = alert.condition === 'above' ? 'subiu acima de' : 'caiu abaixo de';
  const targetValue = alert.value;
  
  const text = `
🚨 <b>Alerta de Preço Disparado!</b> 🚨

O ativo <b>${symbol.toUpperCase()}</b> ${condition} o seu preço limite estabelecido!

📈 <b>Preço Limite:</b> ${targetValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
💰 <b>Preço Atual:</b> ${currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

Acesse o CryptoVision para gerenciar seu portfólio.
  `.trim();

  return sendMessage(chatId, text);
}
