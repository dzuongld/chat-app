// from index.js
const socket = io()

// receive events from server
socket.on('newUser', (user = 'Anonymous') => {
    console.log(user, 'has joined the chat.')
})

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#messageForm').addEventListener('submit', (e) => {
    e.preventDefault() // prevent page refresh

    const message = e.target.elements.message.value // select by name
    socket.emit('sendMessage', message)
})
