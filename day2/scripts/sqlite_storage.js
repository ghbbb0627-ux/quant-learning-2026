// SQLite数据库存储示例
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class SQLiteStorage {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }
  
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`🔗 连接到SQLite数据库: ${this.dbPath}`);
          resolve();
        }
      });
    });
  }
  
  async initialize() {
    // 创建表结构
    const sql = `
      CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        symbol TEXT NOT NULL,
        price REAL NOT NULL,
        volume REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        price REAL NOT NULL,
        volume REAL NOT NULL,
        fee REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ 数据库表初始化完成');
          resolve();
        }
      });
    });
  }
  
  async insertPrice(symbol, price, volume = null) {
    const sql = `
      INSERT INTO price_history (timestamp, symbol, price, volume)
      VALUES (?, ?, ?, ?)
    `;
    const timestamp = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [timestamp, symbol, price, volume], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`📈 插入价格记录: ${symbol} @ ${price}`);
          resolve(this.lastID);
        }
      });
    });
  }
  
  async insertTrade(symbol, side, price, volume, fee = 0) {
    const sql = `
      INSERT INTO trades (timestamp, symbol, side, price, volume, fee)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const timestamp = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [timestamp, symbol, side, price, volume, fee], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`💰 插入交易记录: ${symbol} ${side} ${volume} @ ${price}`);
          resolve(this.lastID);
        }
      });
    });
  }
  
  async queryPrices(symbol, limit = 10) {
    const sql = `
      SELECT * FROM price_history 
      WHERE symbol = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [symbol, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  async getPriceStats(symbol) {
    const sql = `
      SELECT 
        COUNT(*) as count,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price,
        SUM(volume) as total_volume
      FROM price_history 
      WHERE symbol = ?
    `;
    
    return new Promise((resolve, reject) => {
      this.db.get(sql, [symbol], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  
  async getTradeSummary() {
    const sql = `
      SELECT 
        symbol,
        side,
        COUNT(*) as trade_count,
        SUM(volume) as total_volume,
        AVG(price) as avg_price,
        SUM(volume * price) as total_value
      FROM trades 
      GROUP BY symbol, side
    `;
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  
  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('🔒 数据库连接已关闭');
          resolve();
        }
      });
    });
  }
}

// 使用示例
async function demoSQLiteStorage() {
  console.log('🗄️ SQLite数据库存储演示');
  console.log('='.repeat(40));
  
  try {
    // 1. 创建存储实例并连接
    const storage = new SQLiteStorage('trading.db');
    await storage.connect();
    await storage.initialize();
    
    // 2. 插入价格数据
    console.log('\n1. 插入价格数据:');
    await storage.insertPrice('BTCUSDT', 67259.94, 1.5);
    await storage.insertPrice('BTCUSDT', 67280.12, 2.3);
    await storage.insertPrice('ETHUSDT', 2050.45, 12.8);
    await storage.insertPrice('BTCUSDT', 67245.67, 1.8);
    
    // 3. 插入交易数据
    console.log('\n2. 插入交易数据:');
    await storage.insertTrade('BTCUSDT', 'BUY', 67200.00, 0.1, 6.72);
    await storage.insertTrade('BTCUSDT', 'SELL', 67250.00, 0.05, 3.36);
    await storage.insertTrade('ETHUSDT', 'BUY', 2045.00, 2.0, 4.09);
    
    // 4. 查询价格数据
    console.log('\n3. 查询BTC最新价格:');
    const btcPrices = await storage.queryPrices('BTCUSDT', 5);
    console.log(`   最近 ${btcPrices.length} 条BTC价格:`);
    btcPrices.forEach(price => {
      console.log(`   ${price.timestamp}: ${price.price} (${price.volume || 0} BTC)`);
    });
    
    // 5. 获取价格统计
    console.log('\n4. BTC价格统计:');
    const btcStats = await storage.getPriceStats('BTCUSDT');
    if (btcStats) {
      console.log(`   记录数: ${btcStats.count}`);
      console.log(`   价格范围: ${btcStats.min_price} - ${btcStats.max_price}`);
      console.log(`   平均价格: ${btcStats.avg_price?.toFixed(2) || 'N/A'}`);
      console.log(`   总成交量: ${btcStats.total_volume || 0} BTC`);
    }
    
    // 6. 获取交易摘要
    console.log('\n5. 交易摘要:');
    const tradeSummary = await storage.getTradeSummary();
    tradeSummary.forEach(summary => {
      console.log(`   ${summary.symbol} ${summary.side}:`);
      console.log(`     交易次数: ${summary.trade_count}`);
      console.log(`     总成交量: ${summary.total_volume}`);
      console.log(`     平均价格: ${summary.avg_price?.toFixed(2) || 'N/A'}`);
      console.log(`     总价值: ${summary.total_value?.toFixed(2) || 'N/A'} USDT`);
    });
    
    // 7. 数据库文件信息
    console.log('\n6. 数据库文件信息:');
    const stats = fs.statSync('trading.db');
    console.log(`   文件大小: ${stats.size} 字节`);
    console.log(`   创建时间: ${stats.birthtime.toLocaleString()}`);
    console.log(`   最后修改: ${stats.mtime.toLocaleString()}`);
    
    // 8. 关闭连接
    await storage.close();
    
    console.log('\n✅ SQLite存储演示完成！');
    console.log('数据库位置:', path.resolve('trading.db'));
    
  } catch (error) {
    console.error('❌ SQLite演示失败:', error.message);
  }
}

// 运行演示
demoSQLiteStorage();
