/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 14:14:03
 * @LastEditTime: 2019-04-18 13:30:40
 */

const Sequelize = require('sequelize');

//数据库配置信息
const { dbConfig } = require('../config/index');

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