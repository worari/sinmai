// server.js
// Custom Server รวม Next.js และ Socket.io Server สำหรับ Real-time Dashboard & Notification

// โหลดตัวแปรจากไฟล์ .env อัตโนมัติ (ผ่าน Next.js built-in env loader)
try {
  const { loadEnvConfig } = require('@next/env');
  loadEnvConfig(process.cwd());
} catch (e) {
  // หากไม่มี @next/env ให้ข้ามไป
}

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

app.prepare().then(async () => {
  const { getSessionPayloadFromCookieHeader } = await import('./lib/security.js');
  const { db } = await import('./lib/db.js');
  try {
    await db.ensureReady({ forceRefresh: false });
    console.log('✅ PostgreSQL Database initialized & synchronized');
  } catch (pgErr) {
    console.error('⚠️ Initial PostgreSQL connection warning:', pgErr.message);
  }

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
      origin: false,
      methods: ['GET', 'POST']
    }
  });

  global.io = io;
  globalThis.io = io;

  const leaveDynamicRooms = (socket) => {
    for (const room of socket.rooms) {
      if (
        room !== socket.id &&
        (room === 'authenticated' ||
          room.startsWith('user_') ||
          room.startsWith('role_') ||
          room.startsWith('unit_'))
      ) {
        socket.leave(room);
      }
    }
  };

  io.on('connection', (socket) => {
    const cookieHeader = socket.handshake?.headers?.cookie || '';
    const verifiedSession = getSessionPayloadFromCookieHeader(cookieHeader);

    const joinVerifiedRooms = (session) => {
      leaveDynamicRooms(socket);
      if (session?.uid) {
        socket.join('authenticated');
        socket.join(`user_${session.uid}`);
        if (session.role) socket.join(`role_${session.role}`);
        if (session.unitId) socket.join(`unit_${session.unitId}`);
        socket.data.authUser = {
          userId: session.uid,
          role: session.role,
          unitId: session.unitId || ''
        };
      } else {
        socket.data.authUser = null;
      }
    };

    joinVerifiedRooms(verifiedSession);
    console.log('⚡ Socket client connected:', socket.id, verifiedSession ? `[${verifiedSession.role}]` : '[Guest]');

    // ไม่เชื่อถือ role/userId จาก client ตรงๆ ใช้เฉพาะข้อมูลจาก Signed HttpOnly Cookie เท่านั้น
    socket.on('register_client', () => {
      const currentSession = getSessionPayloadFromCookieHeader(socket.handshake?.headers?.cookie || '');
      joinVerifiedRooms(currentSession);
      socket.emit('socket_ready', {
        connected: true,
        authenticated: Boolean(currentSession?.uid),
        socketId: socket.id,
        onlineClients: io.engine.clientsCount
      });
    });

    socket.on('unregister_client', () => {
      leaveDynamicRooms(socket);
      socket.data.authUser = null;
    });

    socket.emit('socket_ready', {
      connected: true,
      authenticated: Boolean(verifiedSession?.uid),
      socketId: socket.id,
      onlineClients: io.engine.clientsCount
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
