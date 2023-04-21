# proxy-server-cli

### 使用方式

`npm i proxy-server -g`
`proxy-server -v 查看当前版本号`
`proxy-server start -w '["/api"]' -s 静态文件根目录 -t http://localhost:18080 -i index.html`


*注意事项*

参数 `-w` 为字符串数组，默认过滤 `'["/api"]'`

参数 `-s` 为静态文件根目录，`必选`

参数 `-t` 为需要代理到的服务地址 `必选`

参数 `-i` 为静态文件首页，默认 `index.html`