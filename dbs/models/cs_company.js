/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 14:19:30
 * @LastEditTime: 2019-04-11 12:16:09
 */

const moment = require('moment');

module.exports = function(sequelize,DataTypes){
    return sequelize.define('cs_company',{
        id:{
            type:DataTypes.INTEGER(11),
            primaryKey:true,
            allowNull:false,
            unique:true,
            autoIncrement:true,
            comment:'主键'
        },
        name:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'公司名称'
        },
        address:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'公司地址'
        },
        postcode:{
            type:DataTypes.INTEGER(11),
            allowNull:false,
            comment:'邮政编码'
        },
        contact:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'联系人'
        },
        mobile:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'手机号'
        },
        phone:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'电话号码'
        },
        fax:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'公司传真'
        },
        email:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'公司邮箱'
        },
        qq:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'企业QQ'
        },
        weixin:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'企业微信'
        },
        weixinPic:{
            type:DataTypes.STRING(1000),
            allowNull:true,
            comment:'企业微信二维码'
        },
        blicense:{
            type:DataTypes.STRING(255),
            allowNull:true,
            comment:'营业执照编码'
        },
        blicensePic:{
            type:DataTypes.STRING(1000),
            allowNull:true,
            comment:'营业执照'
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