const env = process.env.NODE_ENV; // 'dev' or 'prod'

console.log(`Loading ${env} config`);

const dev = {
  app: {
    port: parseInt(process.env.PORT, 10) || 3000
  },
  ssh: {
    host: '0.0.0.0',
    port: 2224
  },
  docker: {
    connection: { socketPath: '/var/run/docker.sock' },
    hub: {
      key: process.env.ENV_DOCKER_AUTH,
    },
    image: process.env.ENV_DOCKER_BASE_IMAGE,
    forcePull: false
  }
};

const prod = {
  app: {
    port: parseInt(process.env.PORT, 10) || 3000
  },
  ssh: {
    host: process.env.ENV_SSH_HOST,
    port: process.env.ENV_SSH_PORT,
  },
  docker: {
    connection:
    {
      protocol: 'http',
      host: process.env.ENV_DOCKER_HOST,
      port: process.env.ENV_DOCKER_PORT,
    },
    hub: {
      key: process.env.ENV_DOCKER_AUTH,
    },
    image: process.env.ENV_DOCKER_BASE_IMAGE,
    forcePull: true
  }
};

const config = {
  dev,
  prod
};

module.exports = config[env];
