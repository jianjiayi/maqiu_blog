/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-15 15:47:37
 * @LastEditTime: 2019-04-16 15:21:51
 */

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
    host: 'smtp.qq.com',
    secureConnection: true, // 使用了 SSL
    secure: true, // true for 465, false for other ports
    auth: {
        user: '1248883899@qq.com', // generated ethereal user
        pass: 'cglivjeijbsubafh'  // generated ethereal password
    },
    from:'麻球科技<1248883899@qq.com>'
}

//redis配置
const redisConfig = {
    url:'localhost',
    port:6379,
    password:'123456'
}


module.exports = {
    secret,
    qiniuConfig,
    redisConfig,
    emailConfig,
}