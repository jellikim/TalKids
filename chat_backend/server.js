import express from 'express';
import http from 'http';
import cors from "cors";
import socketio from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketio.listen(server);

const PORT = 8092;
const ConnectedUsers = [];
const ConnectedUserRooms = {};
const ConnectedUserSocket = {};

const backendServer = 'http://192.168.100.122:8080';

app.use(cors());

io.on('connection', socket => {
    // 사용자 연결
    socket.on('connectUser', data => {
        if (ConnectedUsers.includes(data.userMail)) {
            console.log("user " + data.userMail + " is already connected");

            return;
        }

        ConnectedUsers.push(data.userMail);
        ConnectedUserSocket[data.userMail] = socket;

        console.log('User ' + data.userMail + ' connected');
    });

    socket.on('disconnectUser', data => {
        if (!ConnectedUsers.includes(data.userMail)) {
            console.log("user " + data.userMail + " is already disconnected");

            return;
        }

        ConnectedUsers.splice(ConnectedUsers.indexOf(data.userMail), 1);
        delete ConnectedUserRooms[data.userMail];

        console.log('User ' + data.userMail + ' disconnected');
    });

    // 방 리스트
    socket.on('requestRooms', async data => {
        // 비동기로 사용자 방 리스트 가져오기
        try {
            const response = await fetch(backendServer + "/dm/" + data.userId, {
                headers: {
                    "Content-Type": `application/json`,
                }
            });
            const result = await response.json();
            const userRooms = result.response;

            ConnectedUserRooms[data.userMail] = [];

            userRooms.forEach((userRoom) => {
                if (!ConnectedUserRooms[data.userMail].includes(userRoom)) {
                    ConnectedUserRooms[data.userMail].push(userRoom);

                    socket.join(userRoom.dmRoomId);
                }
            });

            console.log(data.userMail + " get chat rooms");

            io.sockets.to(socket.id).emit('responseRooms', { rooms: userRooms });
        } catch (e) {
            console.log(e);
        }
    });

    // 방 입장, 퇴장
    socket.on('joinRoom', async data => {
        if (!data.sender || !data.receiver) {
            return;
        }

        try {
            const response = await fetch(backendServer + "/dm/room", {
                method: "POST",
                headers: {
                    "Content-Type": `application/json`,
                },
                body: JSON.stringify({
                    sender: data.sender,
                    receiver: data.receiver,
                })
            });
            const result = await response.json();

            console.log(result);

            io.sockets.to(socket.id).emit('responseChatting', { chats: result.response });
        } catch (e) {
            console.log(e);
        }
    });

    // 메시지 송, 수신
    socket.on('requestMessage', async data => {
        try {
            const response = await fetch(backendServer + "/dm/message", {
                method: "POST",
                headers: {
                    "Content-Type": `application/json`,
                },
                body: JSON.stringify({
                    "sender": data.sender,
                    "receiver": data.receiver,
                    "messageContent": data.messageContent,
                    "readCheck": data.readCheck,
                })
            });
            const result = await response.json();

            if (result.response.memberName) {
                if (ConnectedUsers.includes(data.receiver) && !ConnectedUserRooms[data.receiver].includes(data.roomId)) {
                    ConnectedUserSocket[data.receiver].join(data.roomId);
                }

                io.sockets.to(data.roomId).emit('responseMessage', { roomId: data.roomId, ...result.response });
            }
        } catch (e) {
            console.log(e);
        }
    });
});

server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});