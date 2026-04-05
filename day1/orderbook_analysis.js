const Binance = require('binance-api-node').default;
const client = Binance();

async function analyzeOrderBook() {
  console.log('📊 订单簿深度分析...\n');
  
  try {
    const symbol = 'BTCUSDT';
    
    // 1. 获取订单簿深度
    console.log('1. 🔍 获取订单簿深度:');
    const depth = await client.book({ symbol, limit: 10 });
    
    console.log('   买盘 (Bids - 愿意买入):');
    depth.bids.slice(0, 5).forEach((bid, i) => {
      const price = parseFloat(bid.price);
      const quantity = parseFloat(bid.quantity);
      const value = price * quantity;
      console.log(`     ${i+1}. 价格: ${price.toFixed(2)} | 数量: ${quantity} | 价值: ${value.toFixed(2)} USDT`);
    });
    
    console.log('\n   卖盘 (Asks - 愿意卖出):');
    depth.asks.slice(0, 5).forEach((ask, i) => {
      const price = parseFloat(ask.price);
      const quantity = parseFloat(ask.quantity);
      const value = price * quantity;
      console.log(`     ${i+1}. 价格: ${price.toFixed(2)} | 数量: ${quantity} | 价值: ${value.toFixed(2)} USDT`);
    });
    
    // 2. 计算关键指标
    console.log('\n2. 📐 关键指标计算:');
    const bestBid = parseFloat(depth.bids[0].price);
    const bestAsk = parseFloat(depth.asks[0].price);
    const spread = bestAsk - bestBid;
    const spreadPercentage = (spread / bestBid) * 100;
    
    console.log(`   买一价: ${bestBid.toFixed(2)}`);
    console.log(`   卖一价: ${bestAsk.toFixed(2)}`);
    console.log(`   买卖价差: ${spread.toFixed(2)} USDT`);
    console.log(`   价差百分比: ${spreadPercentage.toFixed(4)}%`);
    
    // 3. 计算市场深度
    console.log('\n3. 📈 市场深度分析:');
    
    // 买盘深度（前5档）
    let bidDepth = 0;
    depth.bids.slice(0, 5).forEach(bid => {
      bidDepth += parseFloat(bid.price) * parseFloat(bid.quantity);
    });
    
    // 卖盘深度（前5档）
    let askDepth = 0;
    depth.asks.slice(0, 5).forEach(ask => {
      askDepth += parseFloat(ask.price) * parseFloat(ask.quantity);
    });
    
    console.log(`   买盘深度（前5档）: ${bidDepth.toFixed(2)} USDT`);
    console.log(`   卖盘深度（前5档）: ${askDepth.toFixed(2)} USDT`);
    console.log(`   买卖深度比: ${(bidDepth / askDepth).toFixed(2)}`);
    
    // 4. 模拟交易
    console.log('\n4. 💰 模拟交易计算:');
    console.log('   假设你要买入1个BTC:');
    console.log(`   最优价格（市价单）: ${bestAsk.toFixed(2)} USDT`);
    console.log(`   需要资金: ${bestAsk.toFixed(2)} USDT`);
    
    console.log('\n   假设你要卖出1个BTC:');
    console.log(`   最优价格（市价单）: ${bestBid.toFixed(2)} USDT`);
    console.log(`   获得资金: ${bestBid.toFixed(2)} USDT`);
    
    // 5. 交易成本估算
    console.log('\n5. 📉 交易成本估算:');
    const takerFee = 0.001; // 0.1% Taker费率
    const buyCost = bestAsk * takerFee;
    const sellCost = bestBid * takerFee;
    const roundTripCost = buyCost + sellCost;
    
    console.log(`   买入手续费（Taker）: ${buyCost.toFixed(2)} USDT`);
    console.log(`   卖出手续费（Taker）: ${sellCost.toFixed(2)} USDT`);
    console.log(`   来回交易总成本: ${roundTripCost.toFixed(2)} USDT`);
    console.log(`   成本占交易额: ${(roundTripCost / bestAsk * 100).toFixed(3)}%`);
    
    console.log('\n✅ 订单簿分析完成！');
    console.log('关键理解:');
    console.log('1. 买盘 = 市场愿意买入的价格');
    console.log('2. 卖盘 = 市场愿意卖出的价格');
    console.log('3. 价差 = 买卖价格差距，越小流动性越好');
    console.log('4. 深度 = 市场能承受的交易量');
    console.log('5. 交易成本 = 手续费 + 价差损失');
    
  } catch (error) {
    console.error('❌ 订单簿分析失败:', error.message);
  }
}

analyzeOrderBook();
