const pm2 = require('pm2');
const config = require('./backend/config/env.cjs');

const apps = [
  {
    name: 'hardban-frontend',
    script: 'npm',
    args: 'run dev',
    cwd: './frontend',
    watch: ['./src', './public'],
    ignore_watch: ['node_modules', 'dist', '.git'],
    env: {
      NODE_ENV: config.nodeEnv,
      PORT: 5173,
      VITE_API_URL: config.urls.gateway
    }
  },
  {
    name: 'hardban-gateway',
    script: './backend/server.cjs',
    watch: ['./backend/server.cjs', './backend/routes', './backend/middleware'],
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '500M',
    env: {
      NODE_ENV: config.nodeEnv,
      PORT: config.ports.gateway
    }
  },
  {
    name: 'hardban-music',
    script: './backend/music/server.cjs',
    watch: ['./backend/music'],
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '500M',
    env: {
      NODE_ENV: config.nodeEnv,
      PORT: config.ports.music,
      SERVICE_NAME: 'music'
    }
  },
  {
    name: 'hardban-publishing',
    script: './backend/publishing/server.cjs',
    watch: ['./backend/publishing'],
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '500M',
    env: {
      NODE_ENV: config.nodeEnv,
      PORT: config.ports.publishing,
      SERVICE_NAME: 'publishing'
    }
  },
  {
    name: 'hardban-prometheus',
    script: './backend/prometheus/server.cjs',
    watch: ['./backend/prometheus'],
    ignore_watch: ['node_modules', 'logs', 'models'],
    max_memory_restart: '1G',
    env: {
      NODE_ENV: config.nodeEnv,
      PORT: config.ports.prometheus,
      SERVICE_NAME: 'prometheus'
    }
  }
];

pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start(apps, (err) => {
    if (err) {
      console.error('Error starting apps:', err);
      pm2.disconnect();
      return;
    }

    pm2.list((err, list) => {
      if (err) {
        console.error('Error listing apps:', err);
      } else {
        console.log('Started processes:');
        list.forEach(proc => {
          console.log(`${proc.name}: ${proc.pm2_env.status}`);
        });
      }
      pm2.disconnect();
    });
  });
});