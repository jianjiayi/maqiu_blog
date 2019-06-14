/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-17 17:01:56
 * @LastEditTime: 2019-04-18 15:38:37
 */

//加密工具
const bcrypt = require('bcryptjs');
//模型
const { User,Role,UserRole } = require ('../../dbs/models/index');
//admin、秘钥
const { adminConfig } = require('../../config/index');

const db_common = require('../../dbs/db_common');

const createAdmin =  async()=>{
    //查询用户名为admin的用户是否存在
    const existAdmin = await User.findOne({
        where:{
            username:adminConfig.username
        }
    });

    if(!existAdmin){
        // 加密密码
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(adminConfig.password, salt);
        adminConfig.password = hash;

        const t = await db_common.transaction();

        try{
            // 创建用户
            const user = await User.create({
                username: adminConfig.username,
                password:adminConfig.password,
                email:adminConfig.email,
                roles_id:adminConfig.roles_id,
                nickname:adminConfig.nickname,
                head_img:adminConfig.head_img
            });
            //创建超级管理员角色
            const role = await Role.create({
                role_name:'超级管理员',
                role_desc:'拥有系统所有权限',
            });
            //给管理员添加角色
            const userrole = await UserRole.create({
                userId:user.id,
                roleId:role.id
            });

            await t.commit();
        }catch(e){
            await t.rollback();
            conosle.log(e)
        }
        

    }
}

module.exports = createAdmin()