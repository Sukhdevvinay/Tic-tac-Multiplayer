module.exports = function(socket, io, rooms) {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = { player1: null, player2: null, turn: 1 };
        }

        const room = rooms[roomId];

        if (!room.player1) {
            room.player1 = socket.id;
            socket.emit("PlayerRole", "P1");
        } else if (!room.player2) {
            room.player2 = socket.id;
            socket.emit("PlayerRole", "P2");
        } else {
            socket.emit("PlayerRole", "S"); // Spectator
        }

        socket.on("clicked", (data) => {
            data["Player1"] = room.player1;
            data["Player2"] = room.player2;

            if (socket.id === room.player1 && room.turn === 1) {
                io.to(roomId).emit("After_click", data);
                room.turn = 2;
            } else if (socket.id === room.player2 && room.turn === 2) {
                io.to(roomId).emit("After_click", data);
                room.turn = 1;
            } else if (socket.id === room.player1 || socket.id === room.player2) {
                socket.emit("alrt", "Wait For Your Opponent to Move");
            } else {
                socket.emit("alrt", "You're a Spectator. Watch and Enjoy.");
            }
        });

        // ✨ Fabric.js real-time object sync
        socket.on("Clicked", (data) => {
            socket.to(roomId).emit("AfterClick_effect", data);
        });

        socket.on("groupMove", (data) => {
            socket.to(roomId).emit("groupMove", data);
        });

        socket.on("cursorMove", (data) => {
            socket.to(roomId).emit("cursorMove", data);
        });

        socket.on("remoteUndo", () => {
            socket.to(roomId).emit("remoteUndo");
        });

        socket.on("remoteRedo", () => {
            socket.to(roomId).emit("remoteRedo");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected", socket.id);
            if (room.player1 === socket.id) room.player1 = null;
            else if (room.player2 === socket.id) room.player2 = null;
        });
    });
};
