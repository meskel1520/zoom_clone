const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});
app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);

        socket.to(roomId).broadcast.emit("user_connected", userId);
        console.log("someone joined", roomId);
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message);
        })
        socket.on("disconnect", () => {
            socket.to(roomId).broadcast.emit("user_disconnected",
                // socket.to(roomId).emit("user_disconnected",
                userId);
        });
    });
});
server.listen(process.env.PORT || 3000);