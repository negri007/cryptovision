import axios from 'axios';
import * as logger from 'firebase-functions/logger';

const BASE_URL = 'https://api.alternative.me/fng/';

const isMockMode = () => process.env.FUNCTIONS_EMULATOR === 'true' && !process.env.FEAR_GREED_LIVE;

export interface FearGreedData {
  value: number;
  label: string;
  timestamp: number;
}

export async function getCurrent(): Promise<FearGreedData> {
  if (isMockMode()) {
    logger.info('FearGreed: Running in Mock Mode for getCurrent');
    const val = Math.floor(45 + Math.random() * 20); // Simulates neutral/fear/greed
    let label = 'Neutral';
    if (val < 25) label = 'Extreme Fear';
    else if (val < 45) label = 'Fear';
    else if (val > 75) label = 'Extreme Greed';
    else if (val > 55) label = 'Greed';
    
    return {
      value: val,
      label,
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  try {
    const response = await axios.get(`${BASE_URL}?limit=1`);
    const item = response.data.data[0];
    return {
      value: parseInt(item.value),
      label: item.value_classification,
      timestamp: parseInt(item.timestamp)
    };
  } catch (error: any) {
    logger.error('FearGreed: Error in getCurrent', { error: error.message });
    throw error;
  }
}

export async function getHistory(days = 30): Promise<FearGreedData[]> {
  if (isMockMode()) {
    logger.info(`FearGreed: Running in Mock Mode for getHistory (${days} days)`);
    const history: FearGreedData[] = [];
    const now = Math.floor(Date.now() / 1000);
    const oneDay = 24 * 60 * 60;
    
    for (let i = days - 1; i >= 0; i--) {
      const ts = now - i * oneDay;
      const val = Math.floor(40 + Math.random() * 30);
      let label = 'Neutral';
      if (val < 45) label = 'Fear';
      else if (val > 55) label = 'Greed';
      
      history.push({
        value: val,
        label,
        timestamp: ts
      });
    }
    return history;
  }

  try {
    const response = await axios.get(`${BASE_URL}?limit=${days}`);
    return response.data.data.map((item: any) => ({
      value: parseInt(item.value),
      label: item.value_classification,
      timestamp: parseInt(item.timestamp)
    }));
  } catch (error: any) {
    logger.error(`FearGreed: Error in getHistory for ${days} days`, { error: error.message });
    throw error;
  }
}
