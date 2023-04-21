const net = require('net')

function portIsOccupied (port) {
  const server = net.createServer().listen(port)
  return new Promise((resolve, reject) => {
    server.on('listening', _ => {
      server.close()
      resolve(port)
    })
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        resolve(portIsOccupied(port + 1))
      } else {
        reject(err)
      }
    })
  })
}

module.exports = { portIsOccupied }