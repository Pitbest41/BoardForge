import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import http from "http";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

 const PORT = process.env.PORT || 3000;
server.listen(3000, () => {
  console.log("Server running");
});


  // Track active rooms/lobbies
  const lobbies = new Map();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("create-lobby", (data, callback) => {
      const lobbyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const password = Math.random().toString(36).substring(2, 6).toUpperCase();
      
      lobbies.set(lobbyCode, {
        id: lobbyCode,
        password,
        players: [{ id: socket.id, role: 'host' }],
        gameState: null
      });

      socket.join(lobbyCode);
      
      callback({ success: true, lobbyCode, password });
    });

    socket.on("join-lobby", ({ code, password }, callback) => {
      const lobbyCode = code.toUpperCase();
      const lobby = lobbies.get(lobbyCode);
      
      if (!lobby) {
        return callback({ success: false, error: "Lobby not found" });
      }

      if (lobby.players.length >= 2) {
         // allow spectator mode later
      }

      // Skip password check for simplicity in the demo if not strictly needed, 
      // but let's enforce if both provided
      if (lobby.password && lobby.password.toUpperCase() !== password?.toUpperCase()) {
         return callback({ success: false, error: "Invalid password" });
      }

      lobby.players.push({ id: socket.id, role: 'guest' });
      socket.join(lobbyCode);
      
      io.to(lobbyCode).emit("player-joined", { players: lobby.players.length });
      
      callback({ success: true, lobbyCode });
    });

    socket.on("game-action", ({ lobbyCode, action }) => {
      socket.to(lobbyCode).emit("game-state-updated", action);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Clean up lobbies 
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

}

startServer();
