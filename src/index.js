const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app) // create server outside express
const io = socketio(server) // enable server to use web sockets

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

// register events
io.on('connect', (socket) => {
    console.log('New websocket connection!')

    socket.on('join', ({ username, room }, callback) => {
        // use generated id
        const { error, user } = addUser({ id: socket.id, username, room })
        // notify client when something goes wrong
        if (error) return callback(error)

        // socket.io rooms
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!')) // send event to client
        socket.broadcast
            .to(user.room)
            .emit('message', generateMessage('Admin', user.username + ' has joined the chat!')) // exclude sending socket
        // update user list
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const profane = new Filter()
        if (profane.isProfane(message)) return callback('Profanity is not allowed!')

        // socket.emit('countUpdated',count) // send to one client
        io.to(user.room).emit('message', generateMessage(user.username, message)) // send to all clients
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit(
            'locationMessage',
            generateLocationMessage(user.username, `https://www.google.com/maps?q=${location.lat},${location.lng}`)
        )
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        // only notify relevant room
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left.`))
            // update user list
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

// app.listen(port)
server.listen(port)
