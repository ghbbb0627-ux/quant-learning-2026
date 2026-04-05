// 文本图表可视化示例
class TextCharts {
  // 生成文本柱状图
  static barChart(data, title, width = 40) {
    if (!data || data.length === 0) return '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    const scale = width / maxValue;
    
    let chart = `📊 ${title}\n`;
    chart += '─'.repeat(width + 20) + '\n';
    
    data.forEach(item => {
      const barLength = Math.round(item.value * scale);
      const bar = '█'.repeat(barLength);
      const padding = ' '.repeat(width - barLength);
      chart += `${item.label.padEnd(10)} │${bar}${padding}│ ${item.value.toFixed(2)}\n`;
    });
    
    chart += '─'.repeat(width + 20) + '\n';
    return chart;
  }
  
  // 生成文本折线图
  static lineChart(prices, title, height = 10) {
    if (!prices || prices.length === 0) return '';
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const scale = range > 0 ? height / range : 1;
    
    // 创建画布
    const canvas = Array(height + 1).fill().map(() => Array(prices.length).fill(' '));
    
    // 绘制价格点
    prices.forEach((price, x) => {
      const y = height - Math.round((price - minPrice) * scale);
      if (y >= 0 && y <= height) {
        canvas[y][x] = '●';
      }
    });
    
    // 连接点成线
    for (let i = 1; i < prices.length; i++) {
      const y1 = height - Math.round((prices[i-1] - minPrice) * scale);
      const y2 = height - Math.round((prices[i] - minPrice) * scale);
      
      const startY = Math.min(y1, y2);
      const endY = Math.max(y1, y2);
      
      for (let y = startY; y <= endY; y++) {
        if (y >= 0 && y <= height) {
          if (canvas[y][i] === ' ') {
            canvas[y][i] = '│';
          }
        }
      }
    }
    
    // 构建图表
    let chart = `📈 ${title}\n`;
    chart += `价格范围: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} (Δ${range.toFixed(2)})\n`;
    
    // 添加Y轴标签
    const yStep = range / 5;
    for (let i = height; i >= 0; i--) {
      const value = minPrice + (height - i) * (range / height);
      const label = i % 2 === 0 ? value.toFixed(0) : '';
      chart += `${label.padStart(8)} │ ${canvas[i].join('')}\n`;
    }
    
    // 添加X轴
    chart += ' '.repeat(10) + '└' + '─'.repeat(prices.length) + '\n';
    
    // 添加X轴标签
    const xLabels = [];
    const step = Math.max(1, Math.floor(prices.length / 5));
    for (let i = 0; i < prices.length; i += step) {
      xLabels.push(i.toString().padStart(2));
    }
    chart += ' '.repeat(10) + '  ' + xLabels.join(' '.repeat(step - 2)) + '\n';
    
    return chart;
  }
  
  // 生成价格分布直方图
  static histogram(prices, title, bins = 10) {
    if (!prices || prices.length === 0) return '';
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const binWidth = (maxPrice - minPrice) / bins;
    
    // 统计每个区间的数量
    const histogram = Array(bins).fill(0);
    prices.forEach(price => {
      const binIndex = Math.min(Math.floor((price - minPrice) / binWidth), bins - 1);
      histogram[binIndex]++;
    });
    
    const maxCount = Math.max(...histogram);
    const scale = 30 / maxCount; // 最大宽度30个字符
    
    let chart = `📋 ${title}\n`;
    chart += `数据点数: ${prices.length}, 区间数: ${bins}\n`;
    chart += '─'.repeat(50) + '\n';
    
    histogram.forEach((count, i) => {
      const binStart = minPrice + i * binWidth;
      const binEnd = minPrice + (i + 1) * binWidth;
      const barLength = Math.round(count * scale);
      const bar = '█'.repeat(barLength);
      const label = `${binStart.toFixed(0)}-${binEnd.toFixed(0)}`;
      
      chart += `${label.padStart(12)} │ ${bar.padEnd(30)} │ ${count} (${((count/prices.length)*100).toFixed(1)}%)\n`;
    });
    
    chart += '─'.repeat(50) + '\n';
    return chart;
  }
  
  // 生成相关性矩阵
  static correlationMatrix(correlations, title) {
    if (!correlations || correlations.length === 0) return '';
    
    let chart = `🔗 ${title}\n`;
    chart += '─'.repeat(60) + '\n';
    
    // 表头
    const symbols = [...new Set(correlations.flatMap(c => [c.symbol1, c.symbol2]))];
    chart += 'Symbol'.padEnd(10);
    symbols.forEach(sym => {
      chart += sym.padStart(10);
    });
    chart += '\n' + '─'.repeat(60) + '\n';
    
    // 矩阵内容
    symbols.forEach(sym1 => {
      chart += sym1.padEnd(10);
      symbols.forEach(sym2 => {
        if (sym1 === sym2) {
          chart += '1.00'.padStart(10);
        } else {
          const corr = correlations.find(c => 
            (c.symbol1 === sym1 && c.symbol2 === sym2) || 
            (c.symbol1 === sym2 && c.symbol2 === sym1)
          );
          chart += (corr ? corr.correlation.toFixed(2) : 'N/A').padStart(10);
        }
      });
      chart += '\n';
    });
    
    chart += '─'.repeat(60) + '\n';
    chart += '说明: 1.00=完全正相关, -1.00=完全负相关, 0=无相关\n';
    
    return chart;
  }
}

// 使用示例
function demoTextCharts() {
  console.log('🎨 文本图表可视化演示');
  console.log('='.repeat(50));
  
  // 1. 测试数据
  const volumeData = [
    { label: '09:00', value: 1.5 },
    { label: '09:10', value: 2.3 },
    { label: '09:20', value: 1.8 },
    { label: '09:30', value: 3.1 },
    { label: '09:40', value: 2.7 },
    { label: '09:50', value: 1.9 },
    { label: '10:00', value: 4.2 },
    { label: '10:10', value: 2.1 },
    { label: '10:20', value: 3.5 },
    { label: '10:30', value: 2.8 }
  ];
  
  const priceData = [
    67259.94, 67280.12, 67245.67, 67290.34, 67230.89,
    67275.23, 67300.45, 67285.12, 67295.67, 67310.89
  ];
  
  const correlationData = [
    { symbol1: 'BTC', symbol2: 'ETH', correlation: 0.78 },
    { symbol1: 'BTC', symbol2: 'BNB', correlation: 0.65 },
    { symbol1: 'BTC', symbol2: 'SOL', correlation: 0.42 },
    { symbol1: 'ETH', symbol2: 'BNB', correlation: 0.71 },
    { symbol1: 'ETH', symbol2: 'SOL', correlation: 0.38 },
    { symbol1: 'BNB', symbol2: 'SOL', correlation: 0.55 }
  ];
  
  // 2. 显示柱状图
  console.log('\n1. 成交量柱状图:');
  console.log(TextCharts.barChart(volumeData, 'BTC成交量 (BTC)', 30));
  
  // 3. 显示折线图
  console.log('\n2. 价格折线图:');
  console.log(TextCharts.lineChart(priceData, 'BTC价格走势', 8));
  
  // 4. 显示直方图
  console.log('\n3. 价格分布直方图:');
  console.log(TextCharts.histogram(priceData, 'BTC价格分布', 6));
  
  // 5. 显示相关性矩阵
  console.log('\n4. 加密货币相关性矩阵:');
  console.log(TextCharts.correlationMatrix(correlationData, '加密货币相关性'));
  
  console.log('\n✅ 文本图表演示完成！');
  console.log('💡 在没有图形库时，文本图表是很好的替代方案');
}

// 运行演示
demoTextCharts();
