const path = require('path')//core  module
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users.js')

const app = express()
const server = http.createServer(app)//creates http server
const io = socketio(server) //socketio gets called on http server -- now server supports web socket

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

/*io.on('connection',() => {  // whenever a new connection gets connected to server, this method runs
    console.log('new web socket connection')
})*/

/*let count = 0

io.on('connection',(socket) => {  // socket contains info abt clients 
    console.log('new web socket connection')
    socket.emit('countUpdated',count)//to send an event to client from sever
    socket.on('increment',() => { // to receive the event from client
        count++
        //socket.emit('countUpdated',count) //this emits the event to one client
        io.emit('countUpdated',count)//emits the event to all connection
    }) 
}) */

io.on('connection',(socket) => { //build-in events
    console.log('new web socket connection')
    //socket.emit('message',generateMessage('Welcome'))  //emits to particular connection
    //socket.broadcast.emit('message',generateMessage('a new user has joined')) //emits everyone except them

    socket.on('join',({username,room},callback) => {
        const {error,user} = addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        
        socket.join(user.room)//allows to join a particular room
        //io.to.emit -- emits to everyone in a room, socket.broadcast.to.emit -- sends to everyone except sender in a room
        socket.emit('message',generateMessage('admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage('admin',`${user.username} has joined the room`))
        
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()//enable the user to know whether they have joined or not
    })    
    
    socket.on('sendMessage',(msg,callback) => {
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        const user = getUser(socket.id)
        //io.emit('message',generateMessage(msg)) //emits to everyone
        io.to(user.room).emit('message',generateMessage(user.username,msg))
        callback()
    })

    socket.on('location',(coord,callback) => {
        const user = getUser(socket.id)
        //io.emit('message',`Location: ${coord.latitude}, ${coord.longitude}`)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coord.latitude},${coord.longitude}`))
        callback()
    })

    socket.on('disconnect',() => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message',generateMessage('admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersInRoom(user.room)
            })
        }        
    })    
})

server.listen(port,() => {
    console.log('server is up on port '+port)
})