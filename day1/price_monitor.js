const Binance = require('binance-api-node').default;
const client = Binance();
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  symbol: 'BTCUSDT',
  interval: 10000, // 10秒
  maxRecords: 100,
  dataFile: 'btc_price_history.csv'
};

class PriceMonitor {
  constructor() {
    this.priceHistory = [];
    this.isRunning = false;
    this.dataFile = path.join(__dirname, CONFIG.dataFile);
    
    // 初始化数据文件
    this.initDataFile();
  }
  
  initDataFile() {
    if (!fs.existsSync(this.dataFile)) {
      const header = 'timestamp,price,change,change_percent,volume_24h\n';
      fs.writeFileSync(this.dataFile, header);
      console.log(`📁 创建数据文件: ${this.dataFile}`);
    }
  }
  
  async getMarketData() {
    try {
      // 获取价格
      const prices = await client.prices();
      const currentPrice = parseFloat(prices[CONFIG.symbol]);
      
      // 获取24小时统计
      const ticker = await client.dailyStats({ symbol: CONFIG.symbol });
      const change = parseFloat(ticker.priceChange);
      const changePercent = parseFloat(ticker.priceChangePercent);
      const volume = parseFloat(ticker.volume);
      
      return {
        timestamp: new Date().toISOString(),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume24h: volume
      };
    } catch (error) {
      console.error('获取市场数据失败:', error.message);
      return null;
    }
  }
  
  saveToCSV(data) {
    const csvLine = `${data.timestamp},${data.price},${data.change},${data.changePercent},${data.volume24h}\n`;
    fs.appendFileSync(this.dataFile, csvLine);
  }
  
  formatPriceChange(change, percent) {
    const arrow = change >= 0 ? '📈' : '📉';
    const color = change >= 0 ? '\x1b[32m' : '\x1b[31m'; // 绿色/红色
    const reset = '\x1b[0m';
    return `${arrow} ${color}${change.toFixed(2)} (${percent.toFixed(2)}%)${reset}`;
  }
  
  displayDashboard(data, history) {
    console.clear();
    console.log('='.repeat(60));
    console.log('💰 实时价格监控器 - BTC/USDT');
    console.log('='.repeat(60));
    console.log(`🕒 时间: ${new Date(data.timestamp).toLocaleTimeString()}`);
    console.log(`💰 当前价格: ${data.price.toFixed(2)} USDT`);
    console.log(`📊 24小时变化: ${this.formatPriceChange(data.change, data.changePercent)}`);
    console.log(`📈 24小时成交量: ${data.volume24h.toFixed(2)} BTC`);
    console.log('-'.repeat(60));
    
    // 显示最近价格变化
    if (history.length > 1) {
      console.log('📋 最近价格记录:');
      const recent = history.slice(-5).reverse();
      recent.forEach((record, i) => {
        const time = new Date(record.timestamp).toLocaleTimeString();
        const change = this.formatPriceChange(record.change, record.changePercent);
        console.log(`   ${time} - ${record.price.toFixed(2)} | ${change}`);
      });
    }
    
    console.log('-'.repeat(60));
    console.log('📁 数据保存到:', CONFIG.dataFile);
    console.log('⏸️  按 Ctrl+C 停止监控');
    console.log('='.repeat(60));
  }
  
  async start() {
    console.log('🚀 启动价格监控器...');
    console.log(`监控交易对: ${CONFIG.symbol}`);
    console.log(`更新间隔: ${CONFIG.interval / 1000}秒`);
    console.log('正在获取初始数据...\n');
    
    this.isRunning = true;
    
    while (this.isRunning) {
      try {
        const data = await this.getMarketData();
        
        if (data) {
          this.priceHistory.push(data);
          
          // 保持历史记录数量
          if (this.priceHistory.length > CONFIG.maxRecords) {
            this.priceHistory.shift();
          }
          
          // 保存到CSV
          this.saveToCSV(data);
          
          // 显示仪表板
          this.displayDashboard(data, this.priceHistory);
        }
        
        // 等待指定间隔
        await new Promise(resolve => setTimeout(resolve, CONFIG.interval));
        
      } catch (error) {
        console.error('监控循环错误:', error.message);
        await new Promise(resolve => setTimeout(resolve, CONFIG.interval));
      }
    }
  }
  
  stop() {
    this.isRunning = false;
    console.log('\n🛑 价格监控器已停止');
    console.log(`数据已保存到: ${this.dataFile}`);
    console.log(`总记录数: ${this.priceHistory.length}`);
  }
}

// 运行监控器
const monitor = new PriceMonitor();

// 处理退出信号
process.on('SIGINT', () => {
  monitor.stop();
  process.exit(0);
});

// 启动监控
monitor.start().catch(console.error);
