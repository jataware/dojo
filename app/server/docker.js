const Docker = require('dockerode');
const config = require('./config');

console.log(config.docker.connection);
const docker = new Docker(config.docker.connection);

const emitContainerChanges = (socket, container) => { // eslint-disable-line no-unused-vars
  container.changes((err, data) => {
    if (err) {
      console.log(err.message);
      return;
    }

    const files = data.filter((p) => {
      const path = p.Path;
      if (!path.startsWith('/home/clouseau')) { return false; }
      return (!path.includes('.git'));
    });
    socket.emit('fs_change', files);
  });
};

const listContainers = async () => {
  const containers = await docker.listContainers();
  console.log(containers);
  return containers;
};

const launch = async (name) => {
  if (config.docker.forcePull) {
    const pullStream = await docker.pull(config.docker.image);

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(pullStream, (err, res) => (err ? reject(err) : resolve(res)));
    });
  }

  const container = await docker.createContainer({
    Image: config.docker.image,
    name,
    ExposedPorts: {
      '22/tcp': {},
      '6010/tcp': {}
    },
    HostConfig: {
      AutoRemove: true,
      PortBindings: {
        '22/tcp': [
          {
            HostPort: '2224'
          }
        ],
        '6010/tcp': [
          {
            HostPort: '6010'
          }
        ]
      }
    }
  });

  await container.start();
  return container.id;
};

const commit = async (id, name, cwd, entrypoint) => {
  const container = docker.getContainer(id);
  const res = await container.commit({
    WorkingDir: cwd,
    Entrypoint: entrypoint,
    Cmd: []
  });
  const image = await docker.getImage(res.Id);
  await image.tag({ repo: 'jataware/clouseau', tag: `${name}-latest` });
  const img = docker.getImage(`jataware/clouseau:${name}-latest`);
  const authconfig = { key: config.docker.hub.key };
  const stream = await img.push({ authconfig });

  return stream;
};

const shutdown = async (id) => {
  const container = docker.getContainer(id);
  await container.stop();
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function* genInspect(container) {
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    yield await container.inspect();
  }
}

const exec = async (containerid, cmd) => {
  const container = docker.getContainer(containerid);
  const execContainer = await container.exec({ Cmd: cmd });
  await execContainer.start({ Detach: false });

  // eslint-disable-next-line no-restricted-syntax
  for await (const inspect of genInspect(execContainer)) {
    if (inspect.Running) {
      await delay(1000);
    } else {
      return inspect.ExitCode;
    }
  }
};

module.exports = {
  commit, launch, exec, shutdown, listContainers
};
