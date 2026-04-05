// 数据分析基础示例
const fs = require('fs');
const path = require('path');

class DataAnalyzer {
  constructor(data) {
    this.data = data;
  }
  
  // 基础统计
  basicStats() {
    if (this.data.length === 0) return null;
    
    const prices = this.data.map(d => d.price);
    const volumes = this.data.map(d => d.volume || 0);
    
    // 计算统计指标
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const mean = (arr) => sum(arr) / arr.length;
    const variance = (arr) => {
      const m = mean(arr);
      return sum(arr.map(x => Math.pow(x - m, 2))) / arr.length;
    };
    const std = (arr) => Math.sqrt(variance(arr));
    
    // 排序找中位数
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[sortedPrices.length/2 - 1] + sortedPrices[sortedPrices.length/2]) / 2
      : sortedPrices[Math.floor(sortedPrices.length/2)];
    
    // 找最大值最小值
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    
    // 成交量统计
    const totalVolume = sum(volumes);
    const avgVolume = mean(volumes);
    
    return {
      count: this.data.length,
      price: {
        mean: mean(prices),
        median: median,
        std: std(prices),
        min: minPrice,
        max: maxPrice,
        range: priceRange,
        cv: (std(prices) / mean(prices)) * 100 // 变异系数
      },
      volume: {
        total: totalVolume,
        mean: avgVolume,
        max: Math.max(...volumes),
        min: Math.min(...volumes)
      }
    };
  }
  
  // 价格变化分析
  priceChanges() {
    if (this.data.length < 2) return null;
    
    const changes = [];
    for (let i = 1; i < this.data.length; i++) {
      const change = this.data[i].price - this.data[i-1].price;
      const percent = (change / this.data[i-1].price) * 100;
      changes.push({
        from: this.data[i-1].price,
        to: this.data[i].price,
        change: change,
        percent: percent,
        direction: change >= 0 ? 'up' : 'down'
      });
    }
    
    const upChanges = changes.filter(c => c.direction === 'up');
    const downChanges = changes.filter(c => c.direction === 'down');
    
    return {
      totalChanges: changes.length,
      upCount: upChanges.length,
      downCount: downChanges.length,
      avgChange: changes.reduce((sum, c) => sum + c.change, 0) / changes.length,
      avgPercent: changes.reduce((sum, c) => sum + c.percent, 0) / changes.length,
      maxUp: upChanges.length > 0 ? Math.max(...upChanges.map(c => c.change)) : 0,
      maxDown: downChanges.length > 0 ? Math.min(...downChanges.map(c => c.change)) : 0,
      changes: changes.slice(0, 5) // 返回前5个变化
    };
  }
  
  // 相关性分析（如果有多币种数据）
  correlation(symbol1, symbol2) {
    const data1 = this.data.filter(d => d.symbol === symbol1);
    const data2 = this.data.filter(d => d.symbol === symbol2);
    
    if (data1.length !== data2.length || data1.length < 2) return null;
    
    // 对齐数据（按时间戳）
    const alignedData = [];
    for (let i = 0; i < Math.min(data1.length, data2.length); i++) {
      alignedData.push({
        price1: data1[i].price,
        price2: data2[i].price
      });
    }
    
    const prices1 = alignedData.map(d => d.price1);
    const prices2 = alignedData.map(d => d.price2);
    
    // 计算相关系数
    const mean1 = prices1.reduce((a, b) => a + b) / prices1.length;
    const mean2 = prices2.reduce((a, b) => a + b) / prices2.length;
    
    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;
    
    for (let i = 0; i < prices1.length; i++) {
      const diff1 = prices1[i] - mean1;
      const diff2 = prices2[i] - mean2;
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }
    
    const correlation = numerator / Math.sqrt(denom1 * denom2);
    
    return {
      symbol1: symbol1,
      symbol2: symbol2,
      correlation: correlation,
      strength: Math.abs(correlation) < 0.3 ? '弱' : 
                Math.abs(correlation) < 0.7 ? '中等' : '强',
      direction: correlation > 0 ? '正相关' : '负相关',
      sampleSize: prices1.length
    };
  }
  
  // 生成分析报告
  generateReport() {
    const stats = this.basicStats();
    const changes = this.priceChanges();
    
    let report = '# 数据分析报告\n\n';
    
    if (stats) {
      report += '## 基础统计\n';
      report += `- 数据点数: ${stats.count}\n`;
      report += `- 价格均值: ${stats.price.mean.toFixed(2)}\n`;
      report += `- 价格中位数: ${stats.price.median.toFixed(2)}\n`;
      report += `- 价格标准差: ${stats.price.std.toFixed(2)}\n`;
      report += `- 价格范围: ${stats.price.min.toFixed(2)} - ${stats.price.max.toFixed(2)}\n`;
      report += `- 变异系数: ${stats.price.cv.toFixed(2)}%\n`;
      report += `- 总成交量: ${stats.volume.total.toFixed(2)}\n`;
      report += `- 平均成交量: ${stats.volume.mean.toFixed(2)}\n\n`;
    }
    
    if (changes) {
      report += '## 价格变化分析\n';
      report += `- 总变化次数: ${changes.totalChanges}\n`;
      report += `- 上涨次数: ${changes.upCount} (${((changes.upCount/changes.totalChanges)*100).toFixed(1)}%)\n`;
      report += `- 下跌次数: ${changes.downCount} (${((changes.downCount/changes.totalChanges)*100).toFixed(1)}%)\n`;
      report += `- 平均变化: ${changes.avgChange.toFixed(2)}\n`;
      report += `- 平均变化百分比: ${changes.avgPercent.toFixed(3)}%\n`;
      report += `- 最大上涨: ${changes.maxUp.toFixed(2)}\n`;
      report += `- 最大下跌: ${changes.maxDown.toFixed(2)}\n\n`;
    }
    
    // 添加时间信息
    if (this.data.length > 0) {
      const first = this.data[0];
      const last = this.data[this.data.length - 1];
      report += '## 时间信息\n';
      report += `- 开始时间: ${first.timestamp || 'N/A'}\n`;
      report += `- 结束时间: ${last.timestamp || 'N/A'}\n`;
      report += `- 数据周期: ${this.data.length} 个点\n`;
    }
    
    return report;
  }
}

// 使用示例
async function demoDataAnalysis() {
  console.log('📊 数据分析基础演示');
  console.log('='.repeat(40));
  
  try {
    // 1. 准备测试数据
    console.log('\n1. 准备测试数据...');
    const testData = [
      { timestamp: '2026-04-05T09:00:00Z', symbol: 'BTCUSDT', price: 67259.94, volume: 1.5 },
      { timestamp: '2026-04-05T09:10:00Z', symbol: 'BTCUSDT', price: 67280.12, volume: 2.3 },
      { timestamp: '2026-04-05T09:20:00Z', symbol: 'BTCUSDT', price: 67245.67, volume: 1.8 },
      { timestamp: '2026-04-05T09:30:00Z', symbol: 'BTCUSDT', price: 67290.34, volume: 3.1 },
      { timestamp: '2026-04-05T09:40:00Z', symbol: 'BTCUSDT', price: 67230.89, volume: 2.7 },
      { timestamp: '2026-04-05T09:50:00Z', symbol: 'BTCUSDT', price: 67275.23, volume: 1.9 },
      { timestamp: '2026-04-05T10:00:00Z', symbol: 'BTCUSDT', price: 67300.45, volume: 4.2 },
      { timestamp: '2026-04-05T10:10:00Z', symbol: 'BTCUSDT', price: 67285.12, volume: 2.1 },
      { timestamp: '2026-04-05T10:20:00Z', symbol: 'BTCUSDT', price: 67295.67, volume: 3.5 },
      { timestamp: '2026-04-05T10:30:00Z', symbol: 'BTCUSDT', price: 67310.89, volume: 2.8 }
    ];
    
    // 2. 创建分析器
    const analyzer = new DataAnalyzer(testData);
    
    // 3. 基础统计
    console.log('\n2. 基础统计分析:');
    const stats = analyzer.basicStats();
    if (stats) {
      console.log(`   数据点数: ${stats.count}`);
      console.log(`   价格均值: ${stats.price.mean.toFixed(2)}`);
      console.log(`   价格中位数: ${stats.price.median.toFixed(2)}`);
      console.log(`   价格标准差: ${stats.price.std.toFixed(2)}`);
      console.log(`   价格范围: ${stats.price.min.toFixed(2)} - ${stats.price.max.toFixed(2)}`);
      console.log(`   变异系数: ${stats.price.cv.toFixed(2)}% (波动性指标)`);
      console.log(`   总成交量: ${stats.volume.total.toFixed(2)} BTC`);
      console.log(`   平均成交量: ${stats.volume.mean.toFixed(2)} BTC`);
    }
    
    // 4. 价格变化分析
    console.log('\n3. 价格变化分析:');
    const changes = analyzer.priceChanges();
    if (changes) {
      console.log(`   总变化次数: ${changes.totalChanges}`);
      console.log(`   上涨次数: ${changes.upCount} (${((changes.upCount/changes.totalChanges)*100).toFixed(1)}%)`);
      console.log(`   下跌次数: ${changes.downCount} (${((changes.downCount/changes.totalChanges)*100).toFixed(1)}%)`);
      console.log(`   平均变化: ${changes.avgChange.toFixed(2)}`);
      console.log(`   平均变化百分比: ${changes.avgPercent.toFixed(3)}%`);
      console.log(`   最大上涨: ${changes.maxUp.toFixed(2)}`);
      console.log(`   最大下跌: ${changes.maxDown.toFixed(2)}`);
      
      console.log('\n   前5次价格变化:');
      changes.changes.forEach((change, i) => {
        const arrow = change.direction === 'up' ? '↗' : '↘';
        console.log(`     ${i+1}. ${arrow} ${change.change.toFixed(2)} (${change.percent.toFixed(3)}%)`);
      });
    }
    
    // 5. 生成报告
    console.log('\n4. 生成分析报告...');
    const report = analyzer.generateReport();
    
    // 保存报告
    const reportPath = path.join(__dirname, '..', 'output', 'reports', 'data_analysis_report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`   报告已保存: ${reportPath}`);
    
    // 6. 显示报告摘要
    console.log('\n5. 报告摘要:');
    console.log(report.split('\n').slice(0, 20).join('\n'));
    console.log('... (完整报告已保存到文件)');
    
    console.log('\n✅ 数据分析演示完成！');
    console.log('💡 关键学习:');
    console.log('1. 均值/标准差 - 衡量中心趋势和波动');
    console.log('2. 价格变化 - 分析市场动态');
    console.log('3. 变异系数 - 比较不同资产的波动性');
    console.log('4. 报告生成 - 自动化数据分析输出');
    
  } catch (error) {
    console.error('❌ 数据分析失败:', error.message);
  }
}

// 运行演示
demoDataAnalysis();
