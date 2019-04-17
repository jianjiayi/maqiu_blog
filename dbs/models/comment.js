/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 14:19:30
 * @LastEditTime: 2019-04-11 12:16:09
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('comment',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键'
        },
        topic_id:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'主题id'
        },
        content_text:{
            type:DataTypes.STRING(1000),
            allowNull:true,
            comment:'评论内容'
        },
        formUid:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'评论用id'
        },
        isDel:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:true,//0删除，1正常
            comment:'评论状态'
        },
        createdAt:{
            type:DataTypes.DATE,
            allowNull:false,
            get(){
                return moment(
                    this.getDataValue('createdAt')
                ).format('YYYY-MM-DD HH:MM:SS');
            },
            comment:'创建时间'
        },
        updatedAt:{
            type:DataTypes.DATE,
            allowNull:false,
            get(){
                return moment(
                    this.getDataValue('updatedAt')
                ).format('YYYY-MM-DD HH:MM:SS');
            },
            comment:'更新时间'
        }
    },{
        freezeTableName:true,
    })
}