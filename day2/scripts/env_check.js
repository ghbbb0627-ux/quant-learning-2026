#!/usr/bin/env node
// 环境检查工具

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 量化学习环境检查工具');
console.log('='.repeat(50));

// 检查项目
const checks = [
  {
    name: 'Node.js版本',
    command: 'node --version',
    success: /v\d+\.\d+\.\d+/
  },
  {
    name: 'npm版本',
    command: 'npm --version',
    success: /\d+\.\d+\.\d+/
  },
  {
    name: 'Git版本',
    command: 'git --version',
    success: /git version/
  },
  {
    name: 'SQLite3版本',
    command: 'sqlite3 --version',
    success: /\d+\.\d+\.\d+/,
    optional: true
  }
];

// 执行检查
checks.forEach(check => {
  try {
    const output = execSync(check.command, { encoding: 'utf8' }).trim();
    if (check.success.test(output)) {
      console.log(`✅ ${check.name}: ${output}`);
    } else {
      console.log(`⚠️  ${check.name}: 输出不符合预期`);
    }
  } catch (error) {
    if (check.optional) {
      console.log(`🔶 ${check.name}: 未安装（可选）`);
    } else {
      console.log(`❌ ${check.name}: 未安装或失败`);
    }
  }
});

// 检查目录结构
console.log('\n📁 目录结构检查:');
const requiredDirs = [
  'scripts',
  'data/raw',
  'data/processed',
  'notes',
  'output/charts',
  'output/reports'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ (缺失)`);
  }
});

// 检查数据文件
console.log('\n📊 数据文件检查:');
const dataPath = path.join(__dirname, '..', 'data', 'raw', 'btc_price_history.csv');
if (fs.existsSync(dataPath)) {
  const stats = fs.statSync(dataPath);
  const lines = fs.readFileSync(dataPath, 'utf8').split('\n').length - 1;
  console.log(`✅ 数据文件: ${lines} 条记录`);
  console.log(`   最后修改: ${stats.mtime.toLocaleString()}`);
} else {
  console.log('⚠️  数据文件: 未找到，将创建新数据');
}

console.log('\n🎯 环境检查完成！');
console.log('💡 建议: 确保所有✅项目正常，❌项目需要修复');
