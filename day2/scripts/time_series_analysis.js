// 时间序列分析示例
class TimeSeriesAnalyzer {
  constructor(prices, timestamps) {
    this.prices = prices;
    this.timestamps = timestamps;
  }
  
  // 移动平均线
  movingAverage(windowSize) {
    if (this.prices.length < windowSize) return null;
    
    const ma = [];
    for (let i = windowSize - 1; i < this.prices.length; i++) {
      const sum = this.prices.slice(i - windowSize + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      ma.push(sum / windowSize);
    }
    
    return {
      values: ma,
      timestamps: this.timestamps.slice(windowSize - 1),
      windowSize: windowSize
    };
  }
  
  // 指数移动平均线
  exponentialMovingAverage(span) {
    if (this.prices.length < 2) return null;
    
    const alpha = 2 / (span + 1);
    const ema = [this.prices[0]];
    
    for (let i = 1; i < this.prices.length; i++) {
      ema.push(alpha * this.prices[i] + (1 - alpha) * ema[i-1]);
    }
    
    return {
      values: ema,
      timestamps: this.timestamps,
      span: span
    };
  }
  
  // 计算收益率
  calculateReturns() {
    if (this.prices.length < 2) return null;
    
    const returns = [];
    for (let i = 1; i < this.prices.length; i++) {
      const ret = (this.prices[i] - this.prices[i-1]) / this.prices[i-1];
      returns.push(ret);
    }
    
    return {
      values: returns,
      timestamps: this.timestamps.slice(1),
      mean: returns.reduce((a, b) => a + b) / returns.length,
      std: Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - returns.reduce((a, b) => a + b) / returns.length, 2), 0) / returns.length)
    };
  }
  
  // 波动率计算
  calculateVolatility(windowSize = 20) {
    const returns = this.calculateReturns();
    if (!returns || returns.values.length < windowSize) return null;
    
    const volatilities = [];
    for (let i = windowSize - 1; i < returns.values.length; i++) {
      const windowReturns = returns.values.slice(i - windowSize + 1, i + 1);
      const mean = windowReturns.reduce((a, b) => a + b) / windowSize;
      const variance = windowReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / windowSize;
      volatilities.push(Math.sqrt(variance) * Math.sqrt(365)); // 年化波动率
    }
    
    return {
      values: volatilities,
      timestamps: returns.timestamps.slice(windowSize - 1),
      windowSize: windowSize,
      current: volatilities[volatilities.length - 1] || 0
    };
  }
  
  // 趋势分析
  analyzeTrend() {
    if (this.prices.length < 10) return null;
    
    // 简单线性回归
    const n = this.prices.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = this.prices;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // R平方（拟合优度）
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * i + intercept), 2), 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return {
      slope: slope,
      intercept: intercept,
      rSquared: rSquared,
      direction: slope > 0 ? '上涨' : slope < 0 ? '下跌' : '横盘',
      strength: rSquared < 0.3 ? '弱' : rSquared < 0.7 ? '中等' : '强',
      prediction: slope * n + intercept // 预测下一个点
    };
  }
  
  // 生成分析报告
  generateReport() {
    const trend = this.analyzeTrend();
    const returns = this.calculateReturns();
    const volatility = this.calculateVolatility();
    const ma5 = this.movingAverage(5);
    const ma20 = this.movingAverage(20);
    
    let report = '# 时间序列分析报告\n\n';
    
    report += '## 基本信息\n';
    report += `- 数据点数: ${this.prices.length}\n`;
    report += `- 时间范围: ${this.timestamps[0]} 到 ${this.timestamps[this.timestamps.length - 1]}\n`;
    report += `- 价格范围: ${Math.min(...this.prices).toFixed(2)} - ${Math.max(...this.prices).toFixed(2)}\n\n`;
    
    if (trend) {
      report += '## 趋势分析\n';
      report += `- 趋势方向: ${trend.direction}\n`;
      report += `- 趋势强度: ${trend.strength} (R²=${trend.rSquared.toFixed(3)})\n`;
      report += `- 斜率: ${trend.slope.toFixed(6)} (每时间单位变化)\n`;
      report += `- 预测下一价格: ${trend.prediction.toFixed(2)}\n\n`;
    }
    
    if (returns) {
      report += '## 收益率分析\n';
      report += `- 平均日收益率: ${(returns.mean * 100).toFixed(3)}%\n`;
      report += `- 收益率标准差: ${(returns.std * 100).toFixed(3)}%\n`;
      report += `- 夏普比率(假设无风险利率0%): ${(returns.mean / returns.std).toFixed(3)}\n\n`;
    }
    
    if (volatility) {
      report += '## 波动率分析\n';
      report += `- 当前年化波动率: ${(volatility.current * 100).toFixed(2)}%\n`;
      report += `- 波动率窗口: ${volatility.windowSize} 天\n`;
      report += `- 波动率范围: ${Math.min(...volatility.values).toFixed(4)} - ${Math.max(...volatility.values).toFixed(4)}\n\n`;
    }
    
    if (ma5 && ma20) {
      report += '## 移动平均线分析\n';
      report += `- 5期MA最新值: ${ma5.values[ma5.values.length - 1].toFixed(2)}\n`;
      report += `- 20期MA最新值: ${ma20.values[ma20.values.length - 1].toFixed(2)}\n`;
      
      const ma5Last = ma5.values[ma5.values.length - 1];
      const ma20Last = ma20.values[ma20.values.length - 1];
      const currentPrice = this.prices[this.prices.length - 1];
      
      report += `- 当前价格 vs MA5: ${currentPrice > ma5Last ? '高于' : '低于'} (差距: ${Math.abs(currentPrice - ma5Last).toFixed(2)})\n`;
      report += `- 当前价格 vs MA20: ${currentPrice > ma20Last ? '高于' : '低于'} (差距: ${Math.abs(currentPrice - ma20Last).toFixed(2)})\n`;
      report += `- MA5 vs MA20: ${ma5Last > ma20Last ? '金叉(看多)' : '死叉(看空)'}\n`;
    }
    
    report += '\n## 分析结论\n';
    if (trend && returns && volatility) {
      if (trend.direction === '上涨' && trend.strength !== '弱') {
        report += '✅ 趋势向上，考虑逢低买入\n';
      } else if (trend.direction === '下跌' && trend.strength !== '弱') {
        report += '⚠️  趋势向下，考虑观望或卖出\n';
      } else {
        report += '🔶 趋势不明，建议观望\n';
      }
      
      if (volatility.current > 0.5) {
        report += '⚠️  波动率较高，注意风险管理\n';
      } else if (volatility.current < 0.2) {
        report += '✅ 波动率较低，市场相对稳定\n';
      }
    }
    
    return report;
  }
}

// 使用示例
function demoTimeSeriesAnalysis() {
  console.log('⏰ 时间序列分析演示');
  console.log('='.repeat(50));
  
  // 生成测试数据（模拟30天的价格）
  const days = 30;
  const basePrice = 67000;
  const prices = [];
  const timestamps = [];
  
  let currentPrice = basePrice;
  for (let i = 0; i < days; i++) {
    // 随机波动
    const change = (Math.random() - 0.5) * 1000;
    currentPrice += change;
    currentPrice = Math.max(65000, Math.min(69000, currentPrice)); // 限制范围
    
    prices.push(currentPrice);
    timestamps.push(`2026-04-${(i+1).toString().padStart(2, '0')}T09:00:00Z`);
  }
  
  // 创建分析器
  const analyzer = new TimeSeriesAnalyzer(prices, timestamps);
  
  // 1. 趋势分析
  console.log('\n1. 趋势分析:');
  const trend = analyzer.analyzeTrend();
  if (trend) {
    console.log(`   方向: ${trend.direction}`);
    console.log(`   强度: ${trend.strength} (R²=${trend.rSquared.toFixed(3)})`);
    console.log(`   斜率: ${trend.slope.toFixed(4)}/天`);
    console.log(`   预测明日价格: ${trend.prediction.toFixed(2)}`);
  }
  
  // 2. 移动平均线
  console.log('\n2. 移动平均线:');
  const ma5 = analyzer.movingAverage(5);
  const ma20 = analyzer.movingAverage(20);
  if (ma5 && ma20) {
    console.log(`   MA5最新值: ${ma5.values[ma5.values.length - 1].toFixed(2)}`);
    console.log(`   MA20最新值: ${ma20.values[ma20.values.length - 1].toFixed(2)}`);
    console.log(`   MA5 vs MA20: ${ma5.values[ma5.values.length - 1] > ma20.values[ma20.values.length - 1] ? '金叉(看多)' : '死叉(看空)'}`);
  }
  
  // 3. 收益率分析
  console.log('\n3. 收益率分析:');
  const returns = analyzer.calculateReturns();
  if (returns) {
    console.log(`   平均日收益率: ${(returns.mean * 100).toFixed(3)}%`);
    console.log(`   收益率标准差: ${(returns.std * 100).toFixed(3)}%`);
    console.log(`   夏普比率: ${(returns.mean / returns.std).toFixed(3)}`);
  }
  
  // 4. 波动率分析
  console.log('\n4. 波动率分析:');
  const volatility = analyzer.calculateVolatility(10);
  if (volatility) {
    console.log(`   当前年化波动率: ${(volatility.current * 100).toFixed(2)}%`);
    console.log(`   波动率范围: ${Math.min(...volatility.values).toFixed(4)} - ${Math.max(...volatility.values).toFixed(4)}`);
  }
  
  // 5. 生成报告
  console.log('\n5. 生成分析报告...');
  const report = analyzer.generateReport();
  
  // 保存报告
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '..', 'output', 'reports', 'time_series_report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`   报告已保存: ${reportPath}`);
  
  // 显示报告摘要
  console.log('\n6. 报告摘要:');
  console.log(report.split('\n').slice(0, 25).join('\n'));
  console.log('... (完整报告已保存到文件)');
  
  console.log('\n✅ 时间序列分析演示完成！');
  console.log('💡 关键学习:');
  console.log('1. 移动平均线 - 平滑价格波动');
  console.log('2. 趋势分析 - 判断市场方向');
  console.log('3. 波动率 - 衡量风险程度');
  console.log('4. 夏普比率 - 风险调整后收益');
}

// 运行演示
demoTimeSeriesAnalysis();
