module.exports = {
  devServer: {
    host: '0.0.0.0',
    progress: true, // 显示打包的进度条
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
    }
  }
}