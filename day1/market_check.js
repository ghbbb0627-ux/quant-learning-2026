const Binance = require('binance-api-node').default;
const client = Binance();

async function checkMarket() {
  console.log('🔄 检查加密货币市场状态...');
  
  try {
    // 1. 检查服务器时间
    const time = await client.time();
    console.log('⏰ 服务器时间:', new Date(time).toLocaleString());
    console.log('加密货币市场: 7x24小时不间断交易');
    
    // 2. 获取主要交易对价格
    const prices = await client.prices();
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
    
    console.log('\n💰 主要交易对价格:');
    symbols.forEach(sym => {
      console.log(`  ${sym}: ${prices[sym]}`);
    });
    
    // 3. 检查24小时变化
    const ticker = await client.dailyStats({ symbol: 'BTCUSDT' });
    console.log('\n📊 BTC 24小时变化:');
    console.log(`  价格变化: ${ticker.priceChange}`);
    console.log(`  变化百分比: ${ticker.priceChangePercent}%`);
    console.log(`  当前趋势: ${parseFloat(ticker.priceChange) > 0 ? '上涨' : '下跌'}`);
    
    // 4. 检查订单簿
    const depth = await client.book({ symbol: 'BTCUSDT', limit: 3 });
    console.log('\n📈 订单簿深度 (BTC/USDT):');
    console.log('  买盘 (愿意买入的价格):');
    depth.bids.slice(0, 2).forEach((bid, i) => {
      console.log(`    ${i+1}. ${bid.price} × ${bid.quantity}`);
    });
    console.log('  卖盘 (愿意卖出的价格):');
    depth.asks.slice(0, 2).forEach((ask, i) => {
      console.log(`    ${i+1}. ${ask.price} × ${ask.quantity}`);
    });
    
    const spread = depth.asks[0].price - depth.bids[0].price;
    console.log(`\n📏 买卖价差: ${spread.toFixed(2)} USDT`);
    
    console.log('\n✅ 市场检查完成！所有系统正常。');
    console.log('你现在可以：');
    console.log('1. 查看实时价格数据');
    console.log('2. 理解订单簿机制');
    console.log('3. 分析市场趋势');
    
  } catch (error) {
    console.error('\n❌ 市场检查失败:');
    console.error('错误信息:', error.message);
    console.error('\n🔧 可能原因:');
    console.error('1. 网络连接问题');
    console.error('2. Binance API服务异常');
    console.error('3. 防火墙或代理设置');
    console.error('\n💡 解决方法:');
    console.error('1. 检查网络连接');
    console.error('2. 等待几分钟后重试');
    console.error('3. 访问 https://www.binance.com 确认服务状态');
  }
}

checkMarket();
