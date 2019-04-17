/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-15 16:01:00
 * @LastEditTime: 2019-04-16 18:03:57
 */
const redis = require('redis');
//redis配置
const { redisConfig } = require('../../config/index');

//创建redis实例
const client = redis.createClient(redisConfig.port,redisConfig.url);

//连接错误处理
client.on("error", err => {
    console.log('redis connect err', err);
});

client.on('connect', () => {
    console.log('redis connect success');
})

//验证redis
client.auth(redisConfig.password);

const redisHelper = {};

/**
 * redisHelper setString function
 * @param key
 * @param value
 * @param expire
 */
redisHelper.setString = (key, value, expire) => {
    return new Promise((resolve, reject) => {
        client.set(key, value, function (err, result) {

            if (err) {
                console.log(err);
                reject(err);
            }

            if (!isNaN(expire) && expire > 0) {
                client.expire(key, parseInt(expire));
            }
            resolve(result)
        })
    })
}

/**
 * redisHelper getString function
 * @param key
 */
redisHelper.getString = (key) => {
    return new Promise((resolve, reject) => {
        client.get(key, function (err, result) {
            if (err) {
                console.log(err);
                reject(err)
            }
            resolve(result)
        });
    })
}

/**
 * redisHelper delString function
 * @param key
 */
redisHelper.delString = (key) => {
    return new Promise((resolve, reject) => {
        client.del(key, function (err, result) {
            if (err) {
                console.log(err);
                reject(err)
            }
            resolve(result)
        });
    })
}

module.exports = redisHelper;
