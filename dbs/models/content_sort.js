/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-08 10:07:22
 * @LastEditTime: 2019-04-11 12:23:55
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('content_sort',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键ID'
        },
        pcode:{
            type:DataTypes.STRING(),
            allowNull:false,
            comment:'分类父编码'
        },
        name:{
            type:DataTypes.STRING(),
            allowNull:false,
            comment:'分类名称'
        },
        icon:{
            type:DataTypes.STRING(),
            allowNull:true,
            comment:'分类图标'
        },
        status:{
            type:DataTypes.CHAR(1),
            allowNull:false,
            defaultValue:true,
            comment:'分类使用状态'
        },
        outlink:{
            type:DataTypes.STRING(),
            allowNull:true,
            comment:'外部链接'
        },
        createUserId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'创建者id'
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
        freezeTableName:true
    })
}