module.exports = {
  apps: [
    {
      name: 'OneICU-Consulting',
      cwd: __dirname,
      script: '/usr/bin/bash',
      args: [
        '-lc',
        'cd "$PWD" && PORT=3010 npm run start -- -p 3010 -H 0.0.0.0',
      ],
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        PORT: '3010',
        NODE_ENV: 'production',
      },
    },
    {
      name: 'OneICU-Bot',
      cwd: __dirname,
      script: process.execPath,
      args: ['telegram-bot/server.js'],
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
    },
  ],
};
