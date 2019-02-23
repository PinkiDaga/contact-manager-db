const express = require('express')
require('./config/database') //?

const { contactsRouter } = require('./app/controllers/contacts_controller')
const { usersRouter } = require('./app/controllers/users_controller')
const cors = require('cors')

const app = express() 
const port = 3001
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Welcome to the Contact Manager')
})

app.use('/contacts', contactsRouter )
app.use('/users',usersRouter)

app.listen(port, () => {
    console.log('Listening to port', port)
})