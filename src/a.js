const express = require('express')
const serveStatic = require('express-static')
const path = require('path')

const server = express()

// server.use('/', async (req, res) => {
//   console.log('req', req.url)
//   res.send('str')
// })
server.use(express.static('src'))

server.listen(5000)