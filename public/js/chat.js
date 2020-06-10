const socket = io() //initialise the connection

/*socket.on('countUpdated', (count) => { //to receive the event sent from server
    console.log('the count has been updated to '+count)
})

document.querySelector('#increment').addEventListener('click',() => { //event sent by client
    console.log('click')
    socket.emit('increment') // to send the event to server
})*/

//elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//templates
const messageTemplate = document.querySelector('#message-template')
.innerHTML
const locationTemplate = document.querySelector('#location-template')
.innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template')
.innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoScroll = () => {
    //new msg element
    const $newMessage = $messages.lastElementChild  
    //height of the new msg
    const newMessageStyle = getComputedStyle($newMessage) //gets the margin spacing value
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of mesges container
    const contentHeight = $messages.scrollHeight
    //how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if(contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        //createdAt:message.createdAt -givex UNIX epoch
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e) => { //to prevent default behaviour, pass e
    e.preventDefault()
     
    $messageFormButton.setAttribute('disabled','disabled')//disables the form once the button is submitted
    
    //const msg = document.querySelector('input').value
    const msg = e.target.elements.message.value //to get the input textbox value -- e.target gets the form
    socket.emit('sendMessage',msg,(error) => {//for acknowledging event
        
        $messageFormButton.removeAttribute('disabled')//enables the button
        $messageFormInput.value = '' //empties the text box 
        $messageFormInput.focus()//sets the cursor to textbox

        if(error) {
            return console.log(error)
        }
        console.log('the message was received')
    })
})

$locationButton.addEventListener('click',() => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not support by your browser')
    }

    $locationButton.setAttribute('disable','disable')

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position) 
        socket.emit('location',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },() => {
            console.log('Location shared')  
            $locationButton.removeAttribute('disable')   
        }) 

    })
})

socket.emit('join',{username,room},(error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }      
})
