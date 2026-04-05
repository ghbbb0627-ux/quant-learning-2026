#!/bin/bash
# Day 2快速启动脚本

echo "🚀 启动Day 2量化学习环境"
echo ""

# 1. 打开VS Code
echo "📝 打开VS Code..."
code ~/quant_learning/day2 &

# 2. 打开终端到学习目录
echo "💻 切换到学习目录..."
cd ~/quant_learning/day2
echo "当前目录: $(pwd)"

# 3. 运行环境检查
echo "🔧 运行环境检查..."
node scripts/env_check.js

# 4. 显示今日计划
echo ""
echo "📅 今日学习计划:"
cat plan.md 2>/dev/null || echo "计划文件未找到"

# 5. 提示
echo ""
echo "🎯 准备就绪！"
echo "💡 接下来可以:"
echo "1. 查看今日学习计划"
echo "2. 运行环境检查确认状态"
echo "3. 开始时段1学习"
