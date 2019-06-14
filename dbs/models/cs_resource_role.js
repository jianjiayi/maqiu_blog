/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 14:19:30
 * @LastEditTime: 2019-04-11 12:16:09
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('cs_resource_role',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键'
        },
        roleId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'角色ID'
        },
        resourceId:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'资源ID'
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