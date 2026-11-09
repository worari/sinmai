// server.js
// Custom Server รวม Next.js และ Socket.io Server สำหรับ Real-time Dashboard & Notification

const { createServer } = require('http');
const { parse } = require('url');
const os = require('os');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function getLocalIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (e) {}
  return null;
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // ผูก Socket.io
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  global.io = io;

  io.on('connection', (socket) => {
    console.log('⚡ Socket client connected:', socket.id);

    socket.on('join_unit', (unitId) => {
      socket.join(`unit_${unitId}`);
      console.log(`User ${socket.id} joined unit_${unitId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    const localIp = getLocalIp();
    console.log(`> 🎖️ RTA Claim Management System ready:`);
    console.log(`>   - Local:    http://localhost:${port}`);
    if (localIp) {
      console.log(`>   - Network:  http://${localIp}:${port}`);
    }
    console.log(`> ⚡ Socket.io Server active on port ${port}`);
  });
});
