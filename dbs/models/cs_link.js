/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 14:19:30
 * @LastEditTime: 2019-04-11 12:16:09
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('cs_link',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键'
        },
        gid:{
            type:DataTypes.STRING(255),
            allowNull:false,
            comment:'分组序号'
        },
        name:{
            type:DataTypes.STRING(1000),
            allowNull:true,
            comment:'链接名称'
        },
        
        link:{
            type:DataTypes.STRING(1000),
            allowNull:true,
            comment:'跳转网址'
        },
        logo:{
            type:DataTypes.STRING(1000),
            allowNull:true,
            comment:'图片地址'
        },
        sorting:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            defaultValue:255,//默认插入255
            comment:'排序'
        },
        createUserId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'创建者id'
        },
        isDel:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:true,//0删除，1正常
            comment:'链接状态'
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