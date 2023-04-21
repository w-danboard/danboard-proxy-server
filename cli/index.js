class ProxyServer {
  async exec (name, options) {
    await require(`./${name}`).setup(options)
  }
}

module.exports = new ProxyServer()