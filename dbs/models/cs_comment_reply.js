/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 15:22:54
 * @LastEditTime: 2019-04-11 12:07:59
 */


const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('cs_comment_reply',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键'
        },
        replyId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'回复目标id'
        },
        replyType:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:1,//0评论，1回复
            comment:'回复类型'
        },
        content_text:{
            type:DataTypes.STRING(1000),
            allowNull:true,
            comment:'评论内容'
        },
        formUid:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'回复用户id'
        },
        toUid:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'目标用户id'
        },
        isDel:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:1,//0删除，1正常
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
        freezeTableName:true
    })
}