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
exports.sendEmail = sendEmail;
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'no-reply@cryptovision.com';
const FROM_NAME = 'CryptoVision';
const isMockMode = () => !SENDGRID_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';
async function sendEmail(to, subject, templateId, dynamicData) {
    if (isMockMode()) {
        logger.info(`SendGrid Mock: Sending Email to [${to}]`, {
            subject,
            templateId,
            dynamicData
        });
        return true;
    }
    try {
        const response = await axios_1.default.post('https://api.sendgrid.com/v3/mail/send', {
            personalizations: [
                {
                    to: [{ email: to }],
                    dynamic_template_data: dynamicData
                }
            ],
            from: {
                email: FROM_EMAIL,
                name: FROM_NAME
            },
            subject,
            template_id: templateId
        }, {
            headers: {
                Authorization: `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.status === 202;
    }
    catch (error) {
        logger.error(`SendGrid: Failed to send email to ${to}`, {
            error: error.message,
            response: error.response?.data
        });
        return false;
    }
}
//# sourceMappingURL=sendGrid.js.map