/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-17 17:01:56
 * @LastEditTime: 2019-04-18 15:38:37
 */

//加密工具
const bcrypt = require('bcryptjs');
//模型
const { User } = require ('../../dbs/models/index');
//admin、秘钥
const { adminConfig } = require('../../config/index');

const createAdmin =  async()=>{
    //查询用户名为admin的用户是否存在
    const existAdmin = await User.findOne({
        where:{
            username:adminConfig.username
        }
    });

    console.log('111111111111111')

    if(!existAdmin){
        // 加密密码
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(adminConfig.password, salt);
        adminConfig.password = hash;

        // 创建用户
        await User.create({
            username: adminConfig.username,
            password:adminConfig.password,
            email:adminConfig.email,
            roles_id:adminConfig.roles_id,
            nickname:adminConfig.nickname
        });
    }
}

module.exports = createAdmin()