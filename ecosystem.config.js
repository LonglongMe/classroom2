module.exports = {
  apps: [
    {
      name: 'classrooom',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1, // 或者设置为 'max' 使用集群模式
      exec_mode: 'fork', // 'fork' 或 'cluster'
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0', // 确保监听所有网络接口，而不仅仅是 localhost
      },
      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true, // 日志中添加时间戳
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 自动重启配置
      autorestart: true,
      watch: false, // 生产环境建议设为 false
      max_memory_restart: '1G', // 内存超过 1G 时重启
      
      // 其他配置
      min_uptime: '10s', // 最小运行时间，低于此时间不会重启
      max_restarts: 10, // 最大重启次数
      restart_delay: 4000, // 重启延迟（毫秒）
      
      // 合并日志
      merge_logs: true,
      
      // 忽略监听的文件/目录
      ignore_watch: [
        'node_modules',
        'logs',
        '.next',
        '.git',
        '*.log'
      ],
      
      // 健康检查（可选）
      // 如果需要，可以添加健康检查脚本
      // health_check_grace_period: 3000,
      
      // 退出代码处理
      stop_exit_codes: [0],
      
      // 等待就绪消息的超时时间
      listen_timeout: 10000,
      
      // 终止超时时间
      kill_timeout: 5000,
    }
  ],
  
  // 部署配置（可选）
  deploy: {
    production: {
      user: 'node',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:username/repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};

