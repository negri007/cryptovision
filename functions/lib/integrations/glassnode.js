"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetric = getMetric;
exports.getActiveAddresses = getActiveAddresses;
exports.getExchangeNetFlow = getExchangeNetFlow;
exports.getMinerOutflow = getMinerOutflow;
exports.getNUPL = getNUPL;
exports.getSOPR = getSOPR;
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
const GLASSNODE_API_KEY = process.env.GLASSNODE_API_KEY || '';
const BASE_URL = 'https://api.glassnode.com/v1/metrics';
const isMockMode = () => !GLASSNODE_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';
async function getMetric(asset, metricPath, resolution = '24h') {
    const normAsset = asset.toLowerCase();
    if (isMockMode()) {
        logger.info(`Glassnode: Running in Mock Mode for getMetric (${normAsset}, ${metricPath})`);
        const data = [];
        const now = Math.floor(Date.now() / 1000);
        const daySeconds = 24 * 60 * 60;
        let baseVal = 100000;
        if (metricPath.includes('active_count'))
            baseVal = normAsset === 'btc' ? 850000 : 450000;
        else if (metricPath.includes('netflow'))
            baseVal = (Math.random() - 0.5) * 5000;
        else if (metricPath.includes('miner_outflow'))
            baseVal = 1500;
        else if (metricPath.includes('nupl'))
            baseVal = 0.45;
        else if (metricPath.includes('sopr'))
            baseVal = 1.01;
        for (let i = 10; i >= 0; i--) {
            data.push({
                t: now - i * daySeconds,
                v: baseVal + (Math.random() - 0.5) * (baseVal * 0.1)
            });
        }
        return data;
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}/${metricPath}`, {
            params: {
                a: normAsset.toUpperCase(),
                r: resolution,
                api_key: GLASSNODE_API_KEY
            }
        });
        return response.data; // Response is typically [{ t: timestamp, v: value }]
    }
    catch (error) {
        logger.error(`Glassnode: Error in getMetric for ${normAsset} ${metricPath}`, { error: error.message });
        throw error;
    }
}
async function getActiveAddresses(asset) {
    return getMetric(asset, 'addresses/active_count');
}
async function getExchangeNetFlow(asset) {
    return getMetric(asset, 'transactions/exchanges_netflow');
}
async function getMinerOutflow(asset) {
    return getMetric(asset, 'distribution/miner_outflow');
}
async function getNUPL(asset) {
    return getMetric(asset, 'indicators/nupl');
}
async function getSOPR(asset) {
    return getMetric(asset, 'indicators/sopr');
}
//# sourceMappingURL=glassnode.js.map