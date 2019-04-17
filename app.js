const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')


//解决跨域中间件
const cors = require('koa-cors')
//引入路由接口
const Routers = require('./routes/index');
//jwt验证的路由
const {jwtUnless,tokenError} = require('./routes/jwt-path');

// error handler
onerror(app)

//跨域
app.use(cors());
//token 验证失败的时候会抛出401错误，因此需要添加错误处理
app.use(tokenError);
// 此接口列表，过滤不用jwt验证
app.use(jwtUnless);

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// routes
Routers.map(n => {
  app.use(n.routes() ,n.allowedMethods());
})


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
