const users = []

//add,remove,get users and get users in a room
const addUser = ({id,username,room}) => {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    //validate data
    if(!username || !room) {
        return {
            erorr: 'username and room are required'
        }
    } 
    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //validate username
    if(existingUser) {
        return {
            error: 'username is in use'
        }
    }
    //to store user
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1) {
        return users.splice(index,1)[0] //to remove that user from users, it returns an array of removed users
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room) //filter returns keeps user for which the predicate returned true and discards false users
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}