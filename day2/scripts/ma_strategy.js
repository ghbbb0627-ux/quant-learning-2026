// 移动平均线策略示例
class MAStrategy {
  constructor(prices, shortWindow = 5, longWindow = 20) {
    this.prices = prices;
    this.shortWindow = shortWindow;
    this.longWindow = longWindow;
    this.positions = []; // 持仓记录
    this.trades = [];    // 交易记录
    this.signals = [];   // 信号记录
  }
  
  // 计算移动平均线
  calculateMA(windowSize) {
    if (this.prices.length < windowSize) return null;
    
    const ma = [];
    for (let i = windowSize - 1; i < this.prices.length; i++) {
      const sum = this.prices.slice(i - windowSize + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      ma.push(sum / windowSize);
    }
    
    return ma;
  }
  
  // 生成交易信号
  generateSignals() {
    const shortMA = this.calculateMA(this.shortWindow);
    const longMA = this.calculateMA(this.longWindow);
    
    if (!shortMA || !longMA) return [];
    
    // 对齐数据（从longWindow开始）
    const alignedPrices = this.prices.slice(this.longWindow - 1);
    const alignedShortMA = shortMA.slice(this.longWindow - this.shortWindow);
    
    const signals = [];
    let position = 0; // 0: 空仓, 1: 持多
    
    for (let i = 1; i < alignedPrices.length; i++) {
      const prevSignal = alignedShortMA[i-1] > longMA[i-1] ? 1 : 0;
      const currSignal = alignedShortMA[i] > longMA[i] ? 1 : 0;
      
      let action = 'HOLD';
      if (prevSignal === 0 && currSignal === 1) {
        // 金叉：短期MA上穿长期MA
        action = 'BUY';
        position = 1;
      } else if (prevSignal === 1 && currSignal === 0) {
        // 死叉：短期MA下穿长期MA
        action = 'SELL';
        position = 0;
      }
      
      signals.push({
        index: i + this.longWindow - 1,
        price: alignedPrices[i],
        shortMA: alignedShortMA[i],
        longMA: longMA[i],
        signal: currSignal,
        action: action,
        position: position
      });
    }
    
    this.signals = signals;
    return signals;
  }
  
  // 模拟交易
  simulateTrading(initialCapital = 10000, tradeSize = 0.1) {
    const signals = this.generateSignals();
    if (signals.length === 0) return null;
    
    let capital = initialCapital;
    let btcHoldings = 0;
    let trades = [];
    
    for (const signal of signals) {
      if (signal.action === 'BUY' && capital > 0) {
        // 买入
        const btcToBuy = tradeSize;
        const cost = btcToBuy * signal.price;
        
        if (cost <= capital) {
          btcHoldings += btcToBuy;
          capital -= cost;
          
          trades.push({
            timestamp: signal.index,
            action: 'BUY',
            price: signal.price,
            quantity: btcToBuy,
            cost: cost,
            capital: capital,
            btcHoldings: btcHoldings,
            totalValue: capital + (btcHoldings * signal.price)
          });
        }
      } else if (signal.action === 'SELL' && btcHoldings > 0) {
        // 卖出
        const revenue = btcHoldings * signal.price;
        capital += revenue;
        
        trades.push({
          timestamp: signal.index,
          action: 'SELL',
          price: signal.price,
          quantity: btcHoldings,
          revenue: revenue,
          capital: capital,
          btcHoldings: 0,
          totalValue: capital
        });
        
        btcHoldings = 0;
      }
    }
    
    // 最后平仓
    if (btcHoldings > 0) {
      const finalPrice = signals[signals.length - 1].price;
      const revenue = btcHoldings * finalPrice;
      capital += revenue;
      
      trades.push({
        timestamp: signals.length - 1,
        action: 'SELL',
        price: finalPrice,
        quantity: btcHoldings,
        revenue: revenue,
        capital: capital,
        btcHoldings: 0,
        totalValue: capital
      });
    }
    
    this.trades = trades;
    return trades;
  }
  
  // 计算策略表现
  calculatePerformance(initialCapital = 10000) {
    const trades = this.trades.length > 0 ? this.trades : this.simulateTrading(initialCapital);
    if (!trades || trades.length === 0) return null;
    
    const finalCapital = trades[trades.length - 1].totalValue;
    const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100;
    
    // 计算交易次数
    const buyTrades = trades.filter(t => t.action === 'BUY');
    const sellTrades = trades.filter(t => t.action === 'SELL');
    
    // 计算胜率（盈利交易比例）
    let winningTrades = 0;
    let totalProfit = 0;
    let totalLoss = 0;
    
    for (let i = 0; i < sellTrades.length; i++) {
      const sellTrade = sellTrades[i];
      if (i < buyTrades.length) {
        const buyTrade = buyTrades[i];
        const profit = sellTrade.revenue - buyTrade.cost;
        
        if (profit > 0) {
          winningTrades++;
          totalProfit += profit;
        } else {
          totalLoss += Math.abs(profit);
        }
      }
    }
    
    const winRate = sellTrades.length > 0 ? (winningTrades / sellTrades.length) * 100 : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
    
    // 计算最大回撤
    let maxDrawdown = 0;
    let peak = initialCapital;
    
    for (const trade of trades) {
      if (trade.totalValue > peak) {
        peak = trade.totalValue;
      }
      const drawdown = ((peak - trade.totalValue) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return {
      initialCapital: initialCapital,
      finalCapital: finalCapital,
      totalReturn: totalReturn,
      totalTrades: trades.length,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      winRate: winRate,
      profitFactor: profitFactor,
      maxDrawdown: maxDrawdown,
      sharpeRatio: totalReturn / (maxDrawdown > 0 ? maxDrawdown : 1) // 简化夏普比率
    };
  }
  
  // 生成策略报告
  generateReport() {
    const performance = this.calculatePerformance();
    const signals = this.signals.length > 0 ? this.signals : this.generateSignals();
    
    let report = '# 移动平均线策略分析报告\n\n';
    
    report += '## 策略参数\n';
    report += `- 短期窗口: ${this.shortWindow} 期\n`;
    report += `- 长期窗口: ${this.longWindow} 期\n`;
    report += `- 数据点数: ${this.prices.length}\n`;
    report += `- 价格范围: ${Math.min(...this.prices).toFixed(2)} - ${Math.max(...this.prices).toFixed(2)}\n\n`;
    
    if (signals.length > 0) {
      report += '## 信号统计\n';
      const buySignals = signals.filter(s => s.action === 'BUY').length;
      const sellSignals = signals.filter(s => s.action === 'SELL').length;
      const holdSignals = signals.filter(s => s.action === 'HOLD').length;
      
      report += `- 买入信号: ${buySignals}\n`;
      report += `- 卖出信号: ${sellSignals}\n`;
      report += `- 持有信号: ${holdSignals}\n`;
      report += `- 信号总数: ${signals.length}\n\n`;
      
      // 显示最近5个信号
      report += '## 最近交易信号\n';
      const recentSignals = signals.slice(-5);
      recentSignals.forEach((signal, i) => {
        const arrow = signal.action === 'BUY' ? '🟢' : signal.action === 'SELL' ? '🔴' : '⚪';
        report += `${arrow} ${signal.action} @ ${signal.price.toFixed(2)} (MA${this.shortWindow}: ${signal.shortMA.toFixed(2)}, MA${this.longWindow}: ${signal.longMA.toFixed(2)})\n`;
      });
      report += '\n';
    }
    
    if (performance) {
      report += '## 策略表现\n';
      report += `- 初始资金: $${performance.initialCapital.toFixed(2)}\n`;
      report += `- 最终资金: $${performance.finalCapital.toFixed(2)}\n`;
      report += `- 总收益率: ${performance.totalReturn.toFixed(2)}%\n`;
      report += `- 总交易次数: ${performance.totalTrades}\n`;
      report += `- 买入次数: ${performance.buyTrades}\n`;
      report += `- 卖出次数: ${performance.sellTrades}\n`;
      report += `- 胜率: ${performance.winRate.toFixed(1)}%\n`;
      report += `- 盈亏比: ${performance.profitFactor.toFixed(2)}\n`;
      report += `- 最大回撤: ${performance.maxDrawdown.toFixed(2)}%\n`;
      report += `- 夏普比率: ${performance.sharpeRatio.toFixed(2)}\n\n`;
    }
    
    report += '## 策略原理\n';
    report += '移动平均线策略是一种趋势跟踪策略：\n';
    report += '1. **金叉买入**: 当短期MA上穿长期MA时买入\n';
    report += '2. **死叉卖出**: 当短期MA下穿长期MA时卖出\n';
    report += '3. **参数选择**: 常用MA5/MA20或MA10/MA30组合\n\n';
    
    report += '## 优缺点分析\n';
    report += '✅ **优点**:\n';
    report += '- 简单易懂，容易实现\n';
    report += '- 在趋势市场中表现良好\n';
    report += '- 自动生成买卖信号\n\n';
    
    report += '❌ **缺点**:\n';
    report += '- 在震荡市场中表现不佳\n';
    report += '- 存在滞后性（反应慢）\n';
    report += '- 需要优化参数适应不同市场\n\n';
    
    report += '## 改进建议\n';
    report += '1. 结合其他指标（如RSI、MACD）过滤信号\n';
    report += '2. 添加止损止盈机制\n';
    report += '3. 使用动态参数优化\n';
    report += '4. 考虑交易成本和滑点\n';
    
    return report;
  }
}

// 使用示例
function demoMAStrategy() {
  console.log('📈 移动平均线策略演示');
  console.log('='.repeat(50));
  
  // 生成测试数据（模拟60天的价格）
  const days = 60;
  const basePrice = 67000;
  const prices = [];
  
  let currentPrice = basePrice;
  let trend = 1; // 1: 上涨, -1: 下跌
  
  for (let i = 0; i < days; i++) {
    // 每20天改变趋势
    if (i % 20 === 0) {
      trend = -trend;
    }
    
    // 趋势 + 随机波动
    const trendChange = trend * 50;
    const randomChange = (Math.random() - 0.5) * 200;
    currentPrice += trendChange + randomChange;
    currentPrice = Math.max(65000, Math.min(69000, currentPrice));
    
    prices.push(currentPrice);
  }
  
  console.log(`生成 ${days} 天模拟价格数据`);
  console.log(`价格范围: ${Math.min(...prices).toFixed(2)} - ${Math.max(...prices).toFixed(2)}`);
  
  // 创建策略实例
  const strategy = new MAStrategy(prices, 5, 20);
  
  // 1. 生成信号
  console.log('\n1. 生成交易信号...');
  const signals = strategy.generateSignals();
  console.log(`   信号总数: ${signals.length}`);
  
  const buySignals = signals.filter(s => s.action === 'BUY').length;
  const sellSignals = signals.filter(s => s.action === 'SELL').length;
  console.log(`   买入信号: ${buySignals}`);
  console.log(`   卖出信号: ${sellSignals}`);
  
  // 2. 模拟交易
  console.log('\n2. 模拟交易...');
  const trades = strategy.simulateTrading(10000, 0.1);
  console.log(`   交易次数: ${trades.length}`);
  
  // 3. 计算表现
  console.log('\n3. 策略表现分析:');
  const performance = strategy.calculatePerformance(10000);
  if (performance) {
    console.log(`   初始资金: $${performance.initialCapital.toFixed(2)}`);
    console.log(`   最终资金: $${performance.finalCapital.toFixed(2)}`);
    console.log(`   总收益率: ${performance.totalReturn.toFixed(2)}%`);
    console.log(`   胜率: ${performance.winRate.toFixed(1)}%`);
    console.log(`   最大回撤: ${performance.maxDrawdown.toFixed(2)}%`);
    console.log(`   夏普比率: ${performance.sharpeRatio.toFixed(2)}`);
  }
  
  // 4. 生成报告
  console.log('\n4. 生成策略报告...');
  const report = strategy.generateReport();
  
  // 保存报告
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '..', 'output', 'reports', 'ma_strategy_report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`   报告已保存: ${reportPath}`);
  
  // 显示报告摘要
  console.log('\n5. 报告摘要:');
  console.log(report.split('\n').slice(0, 30).join('\n'));
  console.log('... (完整报告已保存到文件)');
  
  console.log('\n✅ 移动平均线策略演示完成！');
  console.log('💡 关键学习:');
  console.log('1. 金叉/死叉 - 基本交易信号');
  console.log('2. 策略回测 - 历史数据验证');
  console.log('3. 绩效指标 - 评估策略好坏');
  console.log('4. 参数优化 - 寻找最佳参数');
}

// 运行演示
demoMAStrategy();
