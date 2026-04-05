const Binance = require('binance-api-node').default;
const client = Binance();

async function exploreAPI() {
  console.log('🔍 探索Binance API功能...\n');
  
  try {
    // 1. 交易所信息
    console.log('1. 📊 交易所信息:');
    const exchangeInfo = await client.exchangeInfo();
    console.log('   交易对数量:', exchangeInfo.symbols.length);
    console.log('   服务器状态: 正常');
    
    // 2. 获取BTC交易对信息
    const btcSymbol = exchangeInfo.symbols.find(s => s.symbol === 'BTCUSDT');
    if (btcSymbol) {
      console.log('\n2. 📈 BTC/USDT交易对详情:');
      console.log('   状态:', btcSymbol.status);
      console.log('   基础资产:', btcSymbol.baseAsset);
      console.log('   报价资产:', btcSymbol.quoteAsset);
      console.log('   最小交易量:', btcSymbol.filters.find(f => f.filterType === 'LOT_SIZE')?.minQty || 'N/A');
    }
    
    // 3. 获取更多交易对价格
    console.log('\n3. 💰 更多交易对价格:');
    const allPrices = await client.prices();
    const popularPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT'];
    
    popularPairs.forEach(pair => {
      if (allPrices[pair]) {
        console.log(`   ${pair}: ${allPrices[pair]}`);
      }
    });
    
    // 4. 24小时行情
    console.log('\n4. 📉 24小时行情统计:');
    const btcTicker = await client.dailyStats({ symbol: 'BTCUSDT' });
    console.log('   BTC最高价:', btcTicker.highPrice);
    console.log('   BTC最低价:', btcTicker.lowPrice);
    console.log('   BTC成交量:', parseFloat(btcTicker.volume).toFixed(2));
    
    // 5. K线数据（最近5根）
    console.log('\n5. 🕯️ K线数据（1小时）:');
    const klines = await client.candles({ 
      symbol: 'BTCUSDT', 
      interval: '1h',
      limit: 5 
    });
    
    klines.forEach((k, i) => {
      console.log(`   第${i+1}根: 开=${k.open}, 高=${k.high}, 低=${k.low}, 收=${k.close}`);
    });
    
    console.log('\n✅ API探索完成！');
    console.log('你现在可以获取:');
    console.log('1. 交易所信息');
    console.log('2. 交易对详情');
    console.log('3. 实时价格');
    console.log('4. 历史K线');
    console.log('5. 市场统计');
    
  } catch (error) {
    console.error('❌ API探索失败:', error.message);
  }
}

exploreAPI();
