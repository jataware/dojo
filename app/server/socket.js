const config = require('./config');
const SSHClient = require('ssh2').Client;

const socketHandler = (socket) => {
  console.log(socket.request.session);
  const conn = new SSHClient();
  console.log(`ssh connect host: ${config.ssh.host} port ${config.ssh.port}`);

  conn.on('ready', () => {
    socket.emit('terminal', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n');
    conn.shell((err, stream) => {
      if (err) return socket.emit('terminal', `\r\n*** SSH SHELL ERROR: ${err.message} ***\r\n`);
      socket.on('terminal', (data) => {
        stream.write(data);
      });
      stream.on('data', (d) => {
        socket.emit('terminal', d.toString('binary'));
      }).on('close', () => {
        conn.end();
      });
    });
  }).on('close', () => {
    socket.emit('terminal', '\r\n*** SSH CONNECTION CLOSED ***\r\n');
  }).on('error', (err) => {
    socket.emit('terminal', `\r\n*** SSH CONNECTION ERROR: ${err.message} ***\r\n`);
  }).connect({
    host: config.ssh.host,
    port: config.ssh.port,
    username: 'clouseau',
    password: 'clouseau'
    /* privateKey: require('fs').readFileSync('path/to/keyfile') */
  });
};

module.exports = socketHandler;
