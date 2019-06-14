/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-03 15:29:19
 * @LastEditTime: 2019-04-16 11:23:51
 */

//签名工具
const jwt = require('jsonwebtoken');
//格式化
const util = require('util');
const { secret } = require('../../config/index');
const verify = util.promisify(jwt.verify);

const code = require('./statusCode');

/**
 * @name: 校验是否为管理员
 * @param {type} 
 * @returns: 
 */
const checkPermise = async(ctx)=>{
    //获取jwt
    const token = ctx.header.authorization;
    if(!token){
        ctx.response.status = 403;
        ctx.response.status = 403;
        ctx.body = code.ERROR_403('Headers Token不能为空');
        return false;
    }
    try{//登录状态下校验
        //解密
        const payload = await verify(token.split(' ')[1], secret.sign);
        // console.log(payload)
        // role==1为管理员；role==0超级管理员； role==2为普通用户
        if(payload.roles == 2){
            ctx.response.status = 403;
            ctx.body = code.ERROR_403('您没有相关权限');
            return false;
        }

        return true;
    }catch(err){//未登录，游客
        return false;
    }
}

/**
 * @name: 获取用户id
 * @param {type} 
 * @returns: 
 */
const getUserId = async(ctx) =>{
    //获取jwt
    const token = ctx.header.authorization;
    if(!token){
        ctx.response.status = 403;
        ctx.response.status = 403;
        ctx.body = code.ERROR_403('Headers Token不能为空');
        return;
    }
    //解密
    try{//登录用户
        const payload = await verify(token.split(' ')[1], secret.sign);
        return payload;
    }catch(err){//游客
        return false;
    }
}

/**
 * @name: 检验参数是否为空
 * @param {type} 
 * @returns: 
 */

const checkParams = (ctx,params) =>{
    // 检测参数是否存在为空
    let errors = [];
    for (let item in params) {
        if (params[item] === undefined||params[item]==='') {
            let index = errors.length + 1;
            errors.push("错误" + index + ": 参数: " + item + "不能为空")
        }
    }

    if (errors.length > 0) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412(errors);
        return false;
    }
    
    return true;
}


module.exports = {
    checkPermise,
    getUserId,
    checkParams
};