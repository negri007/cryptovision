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
exports.sendMessage = sendMessage;
exports.sendAlertNotification = sendAlertNotification;
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const isMockMode = () => !TELEGRAM_BOT_TOKEN && process.env.FUNCTIONS_EMULATOR === 'true';
async function sendMessage(chatId, text) {
    if (isMockMode()) {
        logger.info(`Telegram Mock: Sending to ChatID [${chatId}]: "${text}"`);
        return true;
    }
    try {
        const response = await axios_1.default.post(`${BASE_URL}/sendMessage`, {
            chat_id: chatId,
            text,
            parse_mode: 'HTML'
        });
        return response.data.ok === true;
    }
    catch (error) {
        logger.error(`Telegram: Failed to send message to ${chatId}`, { error: error.message });
        return false;
    }
}
async function sendAlertNotification(chatId, alert, currentValue) {
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
//# sourceMappingURL=telegram.js.map