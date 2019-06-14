/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-08 09:58:55
 * @LastEditTime: 2019-04-11 12:23:49
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('cs_message',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            autoIncrement:true,
            unique:true,
            comment:'主键id',
        },
        gid:{
            type:DataTypes.STRING(255),
            allowNull:false,
            comment:'分组序号'
        },
        title:{
            type:DataTypes.STRING(),
            allowNull:false,
            comment:'公告标题',
        },
        subtitle:{
            type:DataTypes.STRING(),
            allowNull:false,
            comment:'公告副标题',
        },
        createUserId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'创建者id'
        },
        startTime:{
            type:DataTypes.STRING(),
            allowNull:false,
            comment:'起始时间'
        },
        endTime:{
            type:DataTypes.STRING(),
            allowNull:false,
            comment:'结束时间'
        },
        source:{
            type:DataTypes.STRING(11),
            allowNull:true,
            comment:'来源'
        },
        outlink:{
            type:DataTypes.STRING(),
            allowNull:true,
            comment:'外部链接'
        },
        pageviews:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            defaultValue:0,//默认值0
            comment:'浏览量'
        },
        sorting:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            defaultValue:255,//默认插入255
            comment:'排序'
        },
        content:{
            type:DataTypes.STRING(10000),
            allowNull:true,
            comment:'公告详情',
        },
        tags:{
            type:DataTypes.STRING(500),
            allowNull:true,
            comment:'tag关键字',
        },
        description:{
            type:DataTypes.STRING(200),
            allowNull:true,
            comment:'描述',
        },
        keywords:{
            type:DataTypes.STRING(),
            allowNull:true,
            comment:'关键字'
        },
        status:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:true,//默认值true
            comment:'启用状态'
        },
        istop:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:false,//默认值false
            comment:'是否置顶'
        },
        createdAt:{
            type:DataTypes.DATE,
            allowNull:false,
            get(){
                return moment(
                    this.getDataValue('createdAt')
                ).format('YYYY-MM-DD HH:mm:ss');
            },
            comment:'创建时间'
        },
        updatedAt:{
            type:DataTypes.DATE,
            allowNull:false,
            get(){
                return moment(
                    this.getDataValue('updatedAt')
                ).format('YYYY-MM-DD HH:mm:ss');
            },
            comment:'更新时间'
        }
    },{
        freezeTableName:true
    })
}

