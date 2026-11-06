// ecosystem.config.js
// การตั้งค่า PM2 Process Manager สำหรับระบบสินไหม ทบ. (Production)
module.exports = {
  apps: [
    {
      name: 'rta-sinmai',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 4000
    }
  ]
};
