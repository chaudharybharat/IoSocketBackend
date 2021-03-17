const app = require("express")();
const http = require("http").createServer(app);
const socketio = require("socket.io")(http);
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

app.get("/", (req, res) => {
  res.send("Server is running");
});

socketio.on("connection", (userSocket) => {
  userSocket.on("joinRoom", (data) => {
    console.log("==username===" + data);
    console.log("==username===" + data.username);
    console.log("==room===" + data.room);
    console.log("==userSocket.id===" + userSocket.id);

    const user = userJoin(userSocket.id, data.username, data.room);

    userSocket.join(user.room);

    // // Send users and room info
    socketio.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  userSocket.on("send_message", (data) => {
    console.log("call this funcation");
    const user = getCurrentUser(userSocket.id);
    console.log("==user=id==" + user.id);
    console.log("==user=username==" + user.username);
    console.log("==user=room==" + user.room);
    console.log("==send_message===");
    socketio.to(user.room).emit("receive_message", data);

    // userSocket.broadcast.emit("receive_message", data);
  });

  userSocket.on("typing", (data) => {
    userSocket.broadcast.emit("typing", data);
  });

  userSocket.on("stop_typing", (data) => {
    userSocket.broadcast.emit("stop_typing", data);
  });
});
const PORT = 3001; // process.env.PORT || 3000;

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//http.listen(process.env.PORT);
