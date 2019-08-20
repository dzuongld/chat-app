const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app) // create server outside express
const io = socketio(server) // enable server to use web sockets

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

// register events
io.on('connect', (socket) => {
    console.log('New websocket connection!')

    socket.emit('newUser', 'User1') // send event to client
    socket.on('sendMessage', (message) => {
        // socket.emit('countUpdated',count) // send to one client
        io.emit('message', message) // send to all clients
    })
})

// app.listen(port)
server.listen(port)
