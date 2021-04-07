const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const express = require('express');

const fetch = require('node-fetch');

const session = require('express-session')({
  secret: 'clouseau',
  name: 'clouseau',
  resave: true,
  saveUninitialized: false,
  unset: 'destroy',
  cookie: { clouseau: 'clouseau', maxAge: 60000 }
});

const cookieParser = require('cookie-parser');

const app = express();
const socketIo = require('socket.io');
const docker = require('./docker');
const config = require('./config');

app.use(cors());
app.use(session);
app.use(cookieParser());
app.use(express.json());

const listenPort = (process.env.PORT) ? process.env.PORT : '3000';
const httpServer = app.listen(listenPort, () => { console.log(`Listening on port ${listenPort}!`); });
const io = socketIo(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// routes
app.get('/', (req, res) => {
  res.send('ok');
});

app.get('/socket/config', (req, res) => {
  const address = `ws://${config.ssh.host}:6010`;
  res.json({ address });
});

app.post('/cors/test', async (req, res) => {
  try {
    const { status } = await fetch(req.body.url);
    res.sendStatus(status);
  } catch (err) {
    res.sendStatus(500);
  }
});

app.post('/launch', async (req, res) => {
  try {
    const { name } = req.body;
    const id = await docker.launch(name);
    console.log(`container name: ${name} id: ${id}`);
    res.cookie('docker', JSON.stringify({ container: { id, name } }));
    req.session.docker = {
      container: { id, name }
    };
    res.send(id);
  } catch (err) {
    console.log(`Error: ${err}`);
    res.status(400).send(err.message);
  }
});

app.get('/containers', async (req, res) => {
  const containers = await docker.listContainers();
  res.json(containers);
});

app.put('/commit', async (req, res) => {
  try {
    const { container: { id, name } } = JSON.parse(req.cookies.docker);
    const { cwd, entrypoint } = req.body;
    console.log(`commit container name: ${name} id: ${id}, cwd: ${cwd}, entrypoint: ${entrypoint}`);
    const stream = await docker.commit(id, name, cwd, entrypoint);
    stream.on('data', (data) => {
      const j = data.toString();
      console.log(j);
      req.io.emit('docker_publish', j);
    });
    stream.on('end', () => {
      console.log('finish');
    });
    res.send(id);
  } catch (err) {
    console.log(`Error: ${err}`);
    res.status(400).send(err.message);
  }
});

app.delete('/shutdown/container', async (req, res) => {
  try {
    const { container: { id, name } } = JSON.parse(req.cookies.docker);
    console.log(`shutdown container name: ${name} id: ${id}`);
    await docker.shutdown(id);
    res.clearCookie('docker');
    res.send(id);
  } catch (err) {
    console.log(`Error: ${err}`);
    res.status(400).send(err.message);
  }
});

app.delete('/shutdown/container/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await docker.shutdown(id);
    res.clearCookie('docker');
    res.send(id);
  } catch (err) {
    console.log(`Error: ${err}`);
    res.status(400).send(err.message);
  }
});

app.post('/exec/container', async (req, res) => {
  console.log(`executing command: ${req.body.cmd}`);
  console.log(req.session);
  const { docker: { container: { id } } } = req.session;
  console.log(id);
  const exitcode = await docker.exec(id, req.body.cmd);
  if (exitcode === 0) {
    res.status(200).send('ok');
  } else {
    res.status(500).send(`${exitcode}`);
  }
});

app.post('/exec/container/:id', async (req, res) => {
  console.log(`executing command: ${req.body.cmd}`);
  const { id } = req.params;
  const exitcode = await docker.exec(id, req.body.cmd);
  if (exitcode === 0) {
    res.status(200).send('ok');
  } else {
    res.status(500).send(`${exitcode}`);
  }
});

// socket.io
// expose express session with socket.request.session

/* eslint-disable no-unused-expressions */
io.use((socket, next) => {
  (socket.request.res) ? session(socket.request, socket.request.res, next)
    : next(next);
});
/* eslint-enable no-unused-expressions */

const socketHandler = require('./socket');

io.on('connection', socketHandler);
