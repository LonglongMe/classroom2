# 502 错误排查指南

## 502 错误的常见原因

502 Bad Gateway 错误表示网关（通常是 Nginx）无法从上游服务器（你的 Next.js 应用）获取有效响应。

## 排查步骤

### 1. 检查 PM2 应用状态

```bash
# 查看应用状态
pm2 status

# 查看详细信息
pm2 describe classrooom

# 查看日志（最重要！）
pm2 logs classrooom

# 查看错误日志
pm2 logs classrooom --err
```

### 2. 检查应用是否正常启动

```bash
# 查看进程是否在运行
ps aux | grep next

# 检查端口是否被占用
netstat -tulpn | grep 3000
# 或使用
ss -tulpn | grep 3000
```

### 3. 检查构建是否成功

```bash
# 确保已构建项目
npm run build

# 检查 .next 目录是否存在
ls -la .next/
```

### 4. 检查端口配置

确认 PM2 配置中的端口与 Nginx（或其他反向代理）配置的端口一致。

### 5. 检查 Nginx 配置（如果使用了 Nginx）

检查 `/etc/nginx/sites-available/your-site` 或 `/etc/nginx/nginx.conf`：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;  # 确保端口与 PM2 配置一致
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 常见解决方案

### 方案 1: 重启应用

```bash
# 停止应用
pm2 stop classrooom

# 删除应用
pm2 delete classrooom

# 重新构建
npm run build

# 重新启动
pm2 start ecosystem.config.js --env production
```

### 方案 2: 检查环境变量

确保生产环境变量正确设置。

### 方案 3: 检查日志文件

```bash
# 查看错误日志
tail -f logs/pm2-error.log

# 查看输出日志
tail -f logs/pm2-out.log
```

### 方案 4: 直接测试应用

```bash
# 不使用 PM2，直接启动测试
npm run build
npm start

# 在另一个终端测试
curl http://localhost:3000
```

### 方案 5: 检查防火墙

```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

### 方案 6: 检查 Nginx 错误日志

```bash
# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

## 快速诊断命令

```bash
# 一键诊断脚本
echo "=== PM2 状态 ===" && pm2 status && \
echo "=== 端口检查 ===" && netstat -tulpn | grep 3000 && \
echo "=== 进程检查 ===" && ps aux | grep next && \
echo "=== 最新错误日志 ===" && tail -20 logs/pm2-error.log
```

