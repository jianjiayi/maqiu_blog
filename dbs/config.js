/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 14:14:03
 * @LastEditTime: 2019-04-03 14:13:30
 */

const Sequelize = require('sequelize');
//数据库基本信息
const dbConfig = {
    database:'maqiu',
    username:'root',
    password:'@Jian123321',
    host:'localhost',
    dialect:'mysql'
}
//建立数据库连接
const sequelize = new Sequelize(dbConfig.database,dbConfig.username,dbConfig.password,{
    host:dbConfig.host,
    dialect:dbConfig.dialect,
    dialectOption:{
        //字符集
        charset:"utf8mb4",
        collate:"utf8mb4_unicode_ci",
        supportBigNumbers:true,
        bigNumberStrings:true
    },

    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    },
    operatorsAliases: false,
    timezone:'+08:00'//东八时区
});

module.exports={
    sequelize
}