"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSentiment = analyzeSentiment;
const POSITIVE_WORDS = ['alta', 'crescimento', 'bull', 'lucro', 'sucesso', 'bom', 'ótimo', 'positivo', 'ganho', 'bullish', 'subiu', 'recorde', 'parceria'];
const NEGATIVE_WORDS = ['baixa', 'queda', 'bear', 'prejuízo', 'ruim', 'negativo', 'perda', 'crash', 'bearish', 'caiu', 'despencou', 'fraude', 'investigação'];
function analyzeSentiment(text) {
    const lowerText = text.toLowerCase();
    let score = 0;
    POSITIVE_WORDS.forEach(word => {
        if (lowerText.includes(word))
            score += 1;
    });
    NEGATIVE_WORDS.forEach(word => {
        if (lowerText.includes(word))
            score -= 1;
    });
    let label = 'neutral';
    if (score > 0)
        label = 'positive';
    else if (score < 0)
        label = 'negative';
    return { score, label };
}
//# sourceMappingURL=sentiment.js.map