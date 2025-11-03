#!/bin/bash

# PM2 Next.js 应用诊断脚本
# 用于排查 502 错误

echo "========================================="
echo "PM2 Next.js 应用诊断工具"
echo "========================================="
echo ""

echo "1. 检查 PM2 状态..."
pm2 status
echo ""

echo "2. 检查应用详细信息..."
pm2 describe classrooom 2>/dev/null || echo "应用 'classrooom' 未运行"
echo ""

echo "3. 检查端口 3000 是否被占用..."
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep 3000 || echo "端口 3000 未被占用"
elif command -v ss &> /dev/null; then
    ss -tulpn | grep 3000 || echo "端口 3000 未被占用"
else
    echo "无法检查端口（需要 netstat 或 ss）"
fi
echo ""

echo "4. 检查 Next.js 进程..."
ps aux | grep -E "next|node.*next" | grep -v grep || echo "未找到 Next.js 进程"
echo ""

echo "5. 检查 .next 构建目录..."
if [ -d ".next" ]; then
    echo "✓ .next 目录存在"
    ls -la .next/ | head -5
else
    echo "✗ .next 目录不存在！需要运行 'npm run build'"
fi
echo ""

echo "6. 检查日志文件..."
if [ -d "logs" ]; then
    echo "最新的错误日志（最后 10 行）："
    tail -10 logs/pm2-error.log 2>/dev/null || echo "错误日志文件不存在或为空"
    echo ""
    echo "最新的输出日志（最后 10 行）："
    tail -10 logs/pm2-out.log 2>/dev/null || echo "输出日志文件不存在或为空"
else
    echo "✗ logs 目录不存在"
fi
echo ""

echo "7. 测试本地连接..."
if command -v curl &> /dev/null; then
    echo "测试 http://localhost:3000..."
    curl -s -o /dev/null -w "HTTP 状态码: %{http_code}\n" http://localhost:3000 || echo "连接失败"
else
    echo "curl 未安装，跳过连接测试"
fi
echo ""

echo "8. 检查环境变量..."
echo "NODE_ENV: ${NODE_ENV:-未设置}"
echo "PORT: ${PORT:-未设置}"
echo ""

echo "========================================="
echo "诊断完成！"
echo "========================================="
echo ""
echo "如果应用未运行，请执行："
echo "  npm run build"
echo "  pm2 start ecosystem.config.js --env production"
echo ""
echo "查看实时日志："
echo "  pm2 logs classrooom"

