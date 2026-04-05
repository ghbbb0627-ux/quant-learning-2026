// CSV数据存储示例
const fs = require('fs');
const path = require('path');

class CSVStorage {
  constructor(filename) {
    this.filename = filename;
    this.ensureFile();
  }
  
  ensureFile() {
    // 确保文件存在并有表头
    if (!fs.existsSync(this.filename)) {
      const header = 'timestamp,price,volume\n';
      fs.writeFileSync(this.filename, header);
      console.log(`📁 创建CSV文件: ${this.filename}`);
    }
  }
  
  append(data) {
    // 追加数据到CSV
    const line = `${data.timestamp},${data.price},${data.volume}\n`;
    fs.appendFileSync(this.filename, line);
    console.log(`📝 追加数据: ${data.timestamp} - ${data.price}`);
  }
  
  readAll() {
    // 读取所有数据
    const content = fs.readFileSync(this.filename, 'utf8');
    const lines = content.trim().split('\n');
    
    // 跳过表头
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const [timestamp, price, volume] = lines[i].split(',');
      data.push({
        timestamp,
        price: parseFloat(price),
        volume: parseFloat(volume)
      });
    }
    
    return data;
  }
  
  getStats() {
    // 获取统计信息
    const data = this.readAll();
    if (data.length === 0) return null;
    
    const prices = data.map(d => d.price);
    const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
    
    return {
      count: data.length,
      firstDate: data[0].timestamp,
      lastDate: data[data.length - 1].timestamp,
      avgPrice: prices.reduce((a, b) => a + b) / prices.length,
      totalVolume: totalVolume
    };
  }
}

// 使用示例
async function demoCSVStorage() {
  console.log('📊 CSV数据存储演示');
  console.log('='.repeat(40));
  
  // 创建存储实例
  const storage = new CSVStorage('test_data.csv');
  
  // 添加一些测试数据
  const testData = [
    { timestamp: '2026-04-05T09:00:00Z', price: 67259.94, volume: 1.5 },
    { timestamp: '2026-04-05T09:10:00Z', price: 67280.12, volume: 2.3 },
    { timestamp: '2026-04-05T09:20:00Z', price: 67245.67, volume: 1.8 }
  ];
  
  console.log('1. 添加测试数据:');
  testData.forEach(data => storage.append(data));
  
  console.log('\n2. 读取所有数据:');
  const allData = storage.readAll();
  console.log(`   共 ${allData.length} 条记录`);
  allData.forEach((d, i) => {
    console.log(`   ${i+1}. ${d.timestamp}: ${d.price} (${d.volume} BTC)`);
  });
  
  console.log('\n3. 统计信息:');
  const stats = storage.getStats();
  if (stats) {
    console.log(`   记录数: ${stats.count}`);
    console.log(`   时间范围: ${stats.firstDate} 到 ${stats.lastDate}`);
    console.log(`   平均价格: ${stats.avgPrice.toFixed(2)}`);
    console.log(`   总成交量: ${stats.totalVolume} BTC`);
  }
  
  console.log('\n✅ CSV存储演示完成！');
  console.log('文件位置:', path.resolve('test_data.csv'));
}

// 运行演示
demoCSVStorage().catch(console.error);
