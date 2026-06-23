import axios from 'axios';
import * as logger from 'firebase-functions/logger';

const GLASSNODE_API_KEY = process.env.GLASSNODE_API_KEY || '';
const BASE_URL = 'https://api.glassnode.com/v1/metrics';

const isMockMode = () => !GLASSNODE_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';

export interface OnChainDataPoint {
  t: number; // timestamp in seconds
  v: number; // metric value
}

export async function getMetric(asset: string, metricPath: string, resolution = '24h'): Promise<OnChainDataPoint[]> {
  const normAsset = asset.toLowerCase();
  
  if (isMockMode()) {
    logger.info(`Glassnode: Running in Mock Mode for getMetric (${normAsset}, ${metricPath})`);
    const data: OnChainDataPoint[] = [];
    const now = Math.floor(Date.now() / 1000);
    const daySeconds = 24 * 60 * 60;
    
    let baseVal = 100000;
    if (metricPath.includes('active_count')) baseVal = normAsset === 'btc' ? 850000 : 450000;
    else if (metricPath.includes('netflow')) baseVal = (Math.random() - 0.5) * 5000;
    else if (metricPath.includes('miner_outflow')) baseVal = 1500;
    else if (metricPath.includes('nupl')) baseVal = 0.45;
    else if (metricPath.includes('sopr')) baseVal = 1.01;

    for (let i = 10; i >= 0; i--) {
      data.push({
        t: now - i * daySeconds,
        v: baseVal + (Math.random() - 0.5) * (baseVal * 0.1)
      });
    }
    return data;
  }

  try {
    const response = await axios.get(`${BASE_URL}/${metricPath}`, {
      params: {
        a: normAsset.toUpperCase(),
        r: resolution,
        api_key: GLASSNODE_API_KEY
      }
    });
    return response.data; // Response is typically [{ t: timestamp, v: value }]
  } catch (error: any) {
    logger.error(`Glassnode: Error in getMetric for ${normAsset} ${metricPath}`, { error: error.message });
    throw error;
  }
}

export async function getActiveAddresses(asset: string): Promise<OnChainDataPoint[]> {
  return getMetric(asset, 'addresses/active_count');
}

export async function getExchangeNetFlow(asset: string): Promise<OnChainDataPoint[]> {
  return getMetric(asset, 'transactions/exchanges_netflow');
}

export async function getMinerOutflow(asset: string): Promise<OnChainDataPoint[]> {
  return getMetric(asset, 'distribution/miner_outflow');
}

export async function getNUPL(asset: string): Promise<OnChainDataPoint[]> {
  return getMetric(asset, 'indicators/nupl');
}

export async function getSOPR(asset: string): Promise<OnChainDataPoint[]> {
  return getMetric(asset, 'indicators/sopr');
}
