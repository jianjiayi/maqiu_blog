/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 14:19:30
 * @LastEditTime: 2019-04-11 12:16:09
 */

const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('cs_resource', {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            allowNull: false,
            unique: true,
            autoIncrement: true,
            comment: '主键'
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '资源名称'
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '资源编码'
        },
        path: {
            type: DataTypes.STRING(200),
            allowNull: false,
            comment: '资源路径'
        },
        parent_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '父节点编码'
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '资源类型'
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '资源图标'
        },
        component:{
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '组件名称'
        },
        sorting: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            defaultValue: '255',
            comment: '排序'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                return moment(
                    this.getDataValue('createdAt')
                ).format('YYYY-MM-DD HH:mm:ss');
            },
            comment: '创建时间'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                return moment(
                    this.getDataValue('updatedAt')
                ).format('YYYY-MM-DD HH:mm:ss');
            },
            comment: '更新时间'
        }
    }, {
            freezeTableName: true,
        })
}