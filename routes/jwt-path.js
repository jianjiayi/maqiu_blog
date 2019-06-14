/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 17:31:24
 * @LastEditTime: 2019-04-16 14:41:09
 */


const jwt = require('koa-jwt');
const { secret } = require('../config/index');

//不需要验证登录的路由
const jwtUnless = jwt({secret: secret.sign}).unless({
    path: [
        // 注册
        /^\/user\/register/,
        /^\/user\/register\/email/,
        // 登录
        /^\/user\/login/,
        // 校验用户名是否存在
        /^\/user\/forget\/*/,
        // 忘记密码-修改密码
        /^\/user\/forget\/*/,
        //分类列表
        /^\/sort\/list/,
        //文章详情
        /^\/content\/detail/,
        //文章列表
        /^\/content\/list/,
        //文章评论列表
        /^\/comment\/list/,
        //文章点赞列表
        /^\/praise\/contentAllPraiseList/,
        //上传文件
        /^\/uploads\/*/,
        /^\/upload\/file/,
        //邮箱发送验证吗
        /^\/sendMail\/*/,
        //获取友情链接列表
        /^\/link\/list/,
        //获取公告列表
        /^\/message\/list/,
        //公告详情
        /^\/message\/detail/,
        //获取幻灯片列表
        /^\/banner\/list/,
        //站点信息
        /^\/site\/list/,
        //公司信息
        /^\/company\/list/,
    ]
});

//路由验证信息
const tokenError = (ctx, next) => {
    return next().catch((err) => {
        if(err.status === 401){
            ctx.response.status = 401;
            ctx.body = {
              code:401,
              message:'登录超时或token过期,请重新登录'
            }
        }else{
            throw err;
        }
    })
};

module.exports =  {
    jwtUnless,
    tokenError
}