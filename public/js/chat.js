// from index.js
const socket = io()

// elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationTemplate = document.querySelector('#locationTemplate').innerHTML

// receive events from server
socket.on('newUser', (user = 'Anonymous') => {
    console.log(user, 'has joined the chat.')
})

// regular message
socket.on('message', (message) => {
    console.log(message)
    // final html displayed in browser
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a') // moment.js
    })
    $messages.insertAdjacentHTML('beforeend', html) // bottom of container
})

// location message
socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// send message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() // prevent page refresh

    // disable form after sent
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value // select by name
    socket.emit('sendMessage', message, (error) => {
        // reenable after acknoledgement
        $messageFormButton.removeAttribute('disabled')
        // clear input field
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) return console.log(error)
        console.log('Delivered!')
    })
})

// send location
$sendLocationButton.addEventListener('click', () => {
    // for older os/browsers or non https connection
    if (!navigator.geolocation) return alert('Geolocation not supported by browser!')

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
        const callback = () => {
            console.log('Location shared!')
            $sendLocationButton.removeAttribute('disabled')
        }
        socket.emit('sendLocation', location, callback)
    })
})
