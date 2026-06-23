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
exports.getCurrent = getCurrent;
exports.getHistory = getHistory;
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
const BASE_URL = 'https://api.alternative.me/fng/';
const isMockMode = () => process.env.FUNCTIONS_EMULATOR === 'true' && !process.env.FEAR_GREED_LIVE;
async function getCurrent() {
    if (isMockMode()) {
        logger.info('FearGreed: Running in Mock Mode for getCurrent');
        const val = Math.floor(45 + Math.random() * 20); // Simulates neutral/fear/greed
        let label = 'Neutral';
        if (val < 25)
            label = 'Extreme Fear';
        else if (val < 45)
            label = 'Fear';
        else if (val > 75)
            label = 'Extreme Greed';
        else if (val > 55)
            label = 'Greed';
        return {
            value: val,
            label,
            timestamp: Math.floor(Date.now() / 1000)
        };
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}?limit=1`);
        const item = response.data.data[0];
        return {
            value: parseInt(item.value),
            label: item.value_classification,
            timestamp: parseInt(item.timestamp)
        };
    }
    catch (error) {
        logger.error('FearGreed: Error in getCurrent', { error: error.message });
        throw error;
    }
}
async function getHistory(days = 30) {
    if (isMockMode()) {
        logger.info(`FearGreed: Running in Mock Mode for getHistory (${days} days)`);
        const history = [];
        const now = Math.floor(Date.now() / 1000);
        const oneDay = 24 * 60 * 60;
        for (let i = days - 1; i >= 0; i--) {
            const ts = now - i * oneDay;
            const val = Math.floor(40 + Math.random() * 30);
            let label = 'Neutral';
            if (val < 45)
                label = 'Fear';
            else if (val > 55)
                label = 'Greed';
            history.push({
                value: val,
                label,
                timestamp: ts
            });
        }
        return history;
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}?limit=${days}`);
        return response.data.data.map((item) => ({
            value: parseInt(item.value),
            label: item.value_classification,
            timestamp: parseInt(item.timestamp)
        }));
    }
    catch (error) {
        logger.error(`FearGreed: Error in getHistory for ${days} days`, { error: error.message });
        throw error;
    }
}
//# sourceMappingURL=fearGreed.js.map