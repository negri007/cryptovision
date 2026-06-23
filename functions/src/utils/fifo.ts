export interface Transaction {
  id?: string;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out' | 'staking_reward' | 'airdrop';
  quantity: number;
  price: number;
  executedAt: number;
}

export function calculateFIFO(transactions: Transaction[]) {
  const sortedTx = [...transactions].sort((a, b) => a.executedAt - b.executedAt);
  
  let buyLots: { quantity: number; price: number }[] = [];
  let realizedPnL = 0;
  
  for (const tx of sortedTx) {
    if (['buy', 'transfer_in'].includes(tx.type)) {
      buyLots.push({ quantity: tx.quantity, price: tx.price });
    } else if (['staking_reward', 'airdrop'].includes(tx.type)) {
      buyLots.push({ quantity: tx.quantity, price: 0 });
    } else if (['sell', 'transfer_out'].includes(tx.type)) {
      let remainingToSell = tx.quantity;
      
      while (remainingToSell > 0 && buyLots.length > 0) {
        const lot = buyLots[0];
        
        if (lot.quantity <= remainingToSell) {
          if (tx.type === 'sell') {
            realizedPnL += lot.quantity * (tx.price - lot.price);
          }
          remainingToSell -= lot.quantity;
          buyLots.shift();
        } else {
          if (tx.type === 'sell') {
            realizedPnL += remainingToSell * (tx.price - lot.price);
          }
          buyLots[0].quantity -= remainingToSell;
          remainingToSell = 0;
        }
      }
      
      if (remainingToSell > 0.000001) {
        throw new Error('Insufficient quantity for sale/transfer');
      }
    }
  }
  
  let totalQuantity = 0;
  let totalCost = 0;
  
  for (const lot of buyLots) {
    totalQuantity += lot.quantity;
    totalCost += lot.quantity * lot.price;
  }
  
  const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0;
  
  return {
    averagePrice,
    realizedPnL,
    remainingQuantity: totalQuantity,
    lots: buyLots
  };
}
