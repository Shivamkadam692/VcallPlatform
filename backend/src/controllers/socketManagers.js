import { Server } from "socket.io";

let connection = {};
let messages = {};
let timeOnline = {};
let userDetails = {};

const getParticipants = (path) => {
    if (!connection[path]) return [];
    return connection[path].map((socketId) => ({
        socketId,
        username: userDetails[socketId]?.username || "Guest",
        audioEnabled: userDetails[socketId]?.audioEnabled ?? true
    }));
};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        // JOIN CALL
        socket.on("join-call", (payload) => {
            const { path, username } = typeof payload === "string" ? { path: payload } : payload || {};
            if (!path) return;

            if (!connection[path]) connection[path] = [];
            if (!connection[path].includes(socket.id)) {
                connection[path].push(socket.id);
            }

            timeOnline[socket.id] = new Date();
            userDetails[socket.id] = {
                username: username || "Guest",
                audioEnabled: true,
                room: path
            };

            const participants = getParticipants(path);

            // Notify existing users
            for (let a = 0; a < connection[path].length; a++) {
                io.to(connection[path][a]).emit("user-joined", socket.id, connection[path], participants);
            }

            // Send chat history
            if (messages[path]) {
                messages[path].forEach((msg) => {
                    io.to(socket.id).emit(
                        "chat-message",
                        msg.data,
                        msg.sender,
                        msg["socket-id-sender"]
                    );
                });
            }
        });

        // SIGNALING
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // CHAT MESSAGE
        socket.on("chat-message", (data, sender) => {

            // find the room the user is in
            let matchingRoom = null;

            for (const [roomKey, users] of Object.entries(connection)) {
                if (users.includes(socket.id)) {
                    matchingRoom = roomKey;
                    break;
                }
            }

            if (!matchingRoom) return;

            if (!messages[matchingRoom]) messages[matchingRoom] = [];

            messages[matchingRoom].push({
                data,
                sender,
                "socket-id-sender": socket.id
            });

            // Broadcast to everyone in the room
            connection[matchingRoom].forEach((clientId) => {
                io.to(clientId).emit("chat-message", data, sender, socket.id);
            });

        });

        socket.on("media-state", (state = {}) => {
            if (!userDetails[socket.id]) return;
            const roomKey = userDetails[socket.id].room;
            if (!roomKey || !connection[roomKey]) return;

            userDetails[socket.id] = {
                ...userDetails[socket.id],
                ...state
            };

            const safeState = {
                audioEnabled: userDetails[socket.id].audioEnabled ?? true
            };

            connection[roomKey].forEach((clientId) => {
                io.to(clientId).emit("media-state-changed", socket.id, safeState);
            });
        });

        // DISCONNECT
        socket.on("disconnect", () => {

            for (const [roomKey, users] of Object.entries(connection)) {
                if (users.includes(socket.id)) {

                    // Tell others this user left
                    users.forEach((userId) => {
                        io.to(userId).emit("user-left", socket.id);
                    });

                    // Remove user
                    connection[roomKey] = users.filter(id => id !== socket.id);

                    if (connection[roomKey].length === 0) {
                        delete connection[roomKey];
                    }

                    break;
                }
            }

            delete userDetails[socket.id];
        });
    });

    return io;
};
