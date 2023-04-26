[![license](https://img.shields.io/github/license/http-party/http-server.svg?style=flat-square)](https://github.com/w-danboard/danboard-proxy-server)
# proxy-server

### 使用方式

- `npm i danboard-proxy-server -g`
- `proxy-server -v` 查看当前版本号
- proxy-server start -f '["/api"]' -s 静态文件根目录 -t http://localhost:18080 -i index.html

---

### start参数

参数 `-f` [filters]为字符串数组，默认过滤 `'["/api"]'`

参数 `-s` [staticPath]为静态文件根目录，`必选`

参数 `-t` [target]为需要代理到的服务地址 `必选`

参数 `-i` [index]为静态文件首页，默认 `index.html`