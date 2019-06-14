/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-11 16:20:31
 * @LastEditTime: 2019-04-12 11:16:12
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('cs_praise',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键'
        },
        typeId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'作品或者评论的id'
        },
        userId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'用户id'
        },
        toUserId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'目标用户id'
        },
        type:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            comment:'点赞类型，1作品点赞，2评论点赞，3回复点赞'
        },
        status:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:true,//0取消，1正常
            comment:'评论状态'
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
        freezeTableName:true,
    })
}