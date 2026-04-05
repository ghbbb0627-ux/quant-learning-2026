# 数据目录说明

## 目录结构
- raw/         原始数据（未处理）
- processed/   处理后的数据
- backup/      数据备份

## 数据格式说明

### CSV文件格式（btc_price_history.csv）
timestamp,price,change,change_percent,volume_24h
2026-04-04T12:15:37.123Z,66810.00,156.29,0.234,12345.67

### 字段说明
1. timestamp: 时间戳（ISO格式）
2. price: BTC/USDT价格
3. change: 24小时价格变化
4. change_percent: 24小时变化百分比
5. volume_24h: 24小时成交量

## 数据收集方式
通过 price_monitor.js 脚本每10秒收集一次

## 注意事项
1. 数据为UTC时间
2. 价格单位为USDT
3. 成交量单位为BTC
