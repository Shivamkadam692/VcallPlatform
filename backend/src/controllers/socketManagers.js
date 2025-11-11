import { connect } from "node:http2";
import { Server } from "socket.io";

let connection = {}
let messages = {}
let timeOnline = {}


export const connectToSocket = (server) => {
    const io = new Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    })


    io.on("connection", (socket) => {

        socket.on("join_call", (path) => {
            if(connection[path] === undefined){
                connection[path] = []
            }
            connection[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connection[path].length; i++) {
                io.to(connection[path][a]).emit("user_joined", socket.id, connection[path]);
            }

            if (messages[path] !== undefined){
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                    }

          }       

        })

        socket.on("SIGNAL", (toId,message) => {
            io.to(toId).emit("SIGNAL", socket.id, message);
        })


        socket.on("chat-message", (data, sender) => {
                 const [matchingRoom] = Object.entries(connection)
                 .reduce(([room, idFound], [roomkey, roomValue])=>{
                    if(!idFound && roomValue.includes(socket.id)){
                        return [roomkey, true]
                    }

                    return [room, idFound];

                 },["", false]);

                 if(found === true){
                    if(messages[matchingRoom] === undefined){
                        messages[matchingRoom] = []
                    }
                    messages[matchingRoom].push({data, sender, "socket-id-sender": socket.id})
                    console.log("message", Key, ":", sender,data)

                    connection[matchingRoom].forEach((elem)=> {
                        io.to(elem).emit("chat-message", data, sender, socket.id)
                    })
                }
            })

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());

            var Key

            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connection)))){
                for (let a = 0; a < v.length; ++a) {
                    if(v[a] === socket.id){
                        Key = k

                        for(let a = 0; a < connection[Key].length; ++a){
                            io.to(connection[Key][a]).emit("user-disconnected", socket.id)

                        }

                        var index = connection[Key].indexOf(socket.id);

                        connection[Key].splice(index, 1);

                        if(connection[Key].length === 0){
                            delete connection[Key];
                        }


                    }
            }
        }

        })
    })

return io;

}
