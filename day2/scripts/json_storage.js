// JSON数据存储示例
const fs = require('fs');
const path = require('path');

class JSONStorage {
  constructor(filename) {
    this.filename = filename;
    this.data = this.load();
  }
  
  load() {
    // 从文件加载数据
    try {
      if (fs.existsSync(this.filename)) {
        const content = fs.readFileSync(this.filename, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`读取JSON文件失败: ${error.message}`);
    }
    
    // 默认数据结构
    return {
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: '1.0'
      },
      records: []
    };
  }
  
  save() {
    // 保存数据到文件
    this.data.metadata.updated = new Date().toISOString();
    const content = JSON.stringify(this.data, null, 2); // 漂亮打印
    fs.writeFileSync(this.filename, content);
  }
  
  addRecord(record) {
    // 添加记录
    this.data.records.push({
      id: this.data.records.length + 1,
      timestamp: new Date().toISOString(),
      ...record
    });
    this.save();
    console.log(`📝 添加记录 #${this.data.records.length}`);
  }
  
  getRecord(id) {
    // 获取指定记录
    return this.data.records.find(r => r.id === id);
  }
  
  queryByPrice(minPrice, maxPrice) {
    // 价格区间查询
    return this.data.records.filter(r => 
      r.price >= minPrice && r.price <= maxPrice
    );
  }
  
  getSummary() {
    // 获取摘要信息
    const records = this.data.records;
    if (records.length === 0) return null;
    
    const prices = records.map(r => r.price);
    const volumes = records.map(r => r.volume || 0);
    
    return {
      totalRecords: records.length,
      dateRange: {
        start: records[0].timestamp,
        end: records[records.length - 1].timestamp
      },
      priceStats: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b) / prices.length
      },
      volumeStats: {
        total: volumes.reduce((a, b) => a + b),
        avg: volumes.reduce((a, b) => a + b) / volumes.length
      }
    };
  }
}

// 使用示例
async function demoJSONStorage() {
  console.log('📊 JSON数据存储演示');
  console.log('='.repeat(40));
  
  // 创建存储实例
  const storage = new JSONStorage('trading_data.json');
  
  console.log('1. 添加交易记录:');
  const trades = [
    { symbol: 'BTCUSDT', side: 'BUY', price: 67259.94, volume: 0.1 },
    { symbol: 'BTCUSDT', side: 'SELL', price: 67280.12, volume: 0.05 },
    { symbol: 'ETHUSDT', side: 'BUY', price: 2050.45, volume: 1.2 }
  ];
  
  trades.forEach(trade => storage.addRecord(trade));
  
  console.log('\n2. 查询所有记录:');
  console.log(`   共 ${storage.data.records.length} 条记录`);
  storage.data.records.forEach(record => {
    console.log(`   #${record.id}: ${record.symbol} ${record.side} @ ${record.price}`);
  });
  
  console.log('\n3. 价格区间查询 (67200-67300):');
  const priceQuery = storage.queryByPrice(67200, 67300);
  console.log(`   找到 ${priceQuery.length} 条记录`);
  priceQuery.forEach(record => {
    console.log(`   ${record.symbol}: ${record.price}`);
  });
  
  console.log('\n4. 获取摘要信息:');
  const summary = storage.getSummary();
  if (summary) {
    console.log(`   总记录数: ${summary.totalRecords}`);
    console.log(`   价格范围: ${summary.priceStats.min.toFixed(2)} - ${summary.priceStats.max.toFixed(2)}`);
    console.log(`   平均价格: ${summary.priceStats.avg.toFixed(2)}`);
    console.log(`   总成交量: ${summary.volumeStats.total.toFixed(2)}`);
  }
  
  console.log('\n5. 查看文件内容:');
  console.log('   文件大小:', fs.statSync('trading_data.json').size, '字节');
  console.log('   最后修改:', fs.statSync('trading_data.json').mtime.toLocaleString());
  
  console.log('\n✅ JSON存储演示完成！');
  console.log('文件位置:', path.resolve('trading_data.json'));
}

// 运行演示
demoJSONStorage().catch(console.error);
