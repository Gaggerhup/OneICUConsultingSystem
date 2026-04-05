module.exports = {
  apps: [
    {
      name: 'OneICU-Consulting',
      cwd: '/root/OneICUConsultingSystem',
      script: '/usr/bin/bash',
      args: [
        '-lc',
        'cd /root/OneICUConsultingSystem && PORT=8000 node ./node_modules/next/dist/bin/next dev -p 8000 -H 0.0.0.0',
      ],
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        PORT: '8000',
      },
    },
    {
      name: 'OneICU-Bot',
      cwd: '/root/OneICUConsultingSystem',
      script: '/usr/bin/node',
      args: ['telegram-bot/server.js'],
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
    },
  ],
};
