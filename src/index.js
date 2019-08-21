const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app) // create server outside express
const io = socketio(server) // enable server to use web sockets

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

// register events
io.on('connect', (socket) => {
    console.log('New websocket connection!')

    socket.emit('message', generateMessage('Welcome!')) // send event to client
    socket.broadcast.emit('newUser', 'User1') // exclude sending socket

    socket.on('sendMessage', (message, callback) => {
        const profane = new filter()
        if (profane.isProfane(message)) return callback('Profanity is not allowed!')

        // socket.emit('countUpdated',count) // send to one client
        io.emit('message', generateMessage(message)) // send to all clients
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        io.emit(
            'locationMessage',
            generateLocationMessage(`https://www.google.com/maps?q=${location.lat},${location.lng}`)
        )
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left.'))
    })
})

// app.listen(port)
server.listen(port)
