/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-15 15:47:37
 * @LastEditTime: 2019-04-19 11:18:34
 */


//超级管理员信息
let adminConfig = {
    username: 'admin',
    password:'2ce1cf5cc9c93d4b6060454b2f4719cf',//密码：md5(maqiu123321)
    email:'13121378101@163.com',
    roles_id:0,
    nickname:'@admin',
    head_img:'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
}

//数据库配置
const dbConfig = {
    database:'dwkjCMS',//maqiu
    username:'root',
    password:'mysqldwkj2017',//@Jian123321
    host:'localhost',
    dialect:'mysql'

    // database:'maqiu',//
    // username:'root',
    // password:'@Jian123321',//
    // host:'localhost',
    // dialect:'mysql'
}

//秘钥配置
const secret = {
    sign: "secret"
}

// 七牛云配置
const qiniuConfig = {
    accessKey:'myGxyaEQl-G9PZCJ7ayKmdWHWWS5lcgE37jZJMHU',
    secretKey:'8g3dVMQBagyLIiyN_Ytgl4w0LR7xryjk4h42uSWh',
    scope:'maqiukeji',
    Domain:'http://upload-z1.qiniup.com'
}

//发送邮件配置
const emailConfig = {
    host: 'smtp.163.com',//qq邮箱：smtp.qq.com；163邮箱：smtp.163.com
    secureConnection: true, // 使用了 SSL
    secure: true, // true for 465, false for other ports
    auth: {
        user: '13121378101@163.com', // 发送邮箱qq账号:1248883899@qq.com;163账号：13121378101@163.com
        pass: 'maqiu123321'  // 授权码   这个不是密码，是申请下来的
    },
    from:'麻球科技<13121378101@163.com>'
}

//redis配置
const redisConfig = {
    url:'localhost',
    port:6379,
    password:'123456'
}


module.exports = {
    adminConfig,
    dbConfig,
    secret,
    qiniuConfig,
    redisConfig,
    emailConfig,
}