/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 14:19:30
 * @LastEditTime: 2019-04-11 12:16:09
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('cs_site',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键'
        },
        title:{
            type:DataTypes.STRING(255),
            allowNull:false,
            comment:'站点标题'
        },
        subtitle:{
            type:DataTypes.STRING(255),
            allowNull:false,
            comment:'站点副标题'
        },
        domain:{
            type:DataTypes.STRING(255),
            allowNull:false,
            comment:'站点域名'
        },
        logo:{
            type:DataTypes.STRING(500),
            allowNull:false,
            comment:'站点logo'
        },
        keywords:{
            type:DataTypes.STRING(1000),
            allowNull:false,
            comment:'站点关键字'
        },
        description:{
            type:DataTypes.STRING(1000),
            allowNull:false,
            comment:'站点描述'
        },
        icp:{
            type:DataTypes.STRING(255),
            allowNull:false,
            comment:'站点备案'
        },
        theme:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'站点主题'
        },
        statistical:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'站点统计码'
        },
        copyright:{
            type:DataTypes.STRING(255),
            allowNull:false,
            comment:'版权信息'
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