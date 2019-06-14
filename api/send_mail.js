/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-15 13:46:42
 * @LastEditTime: 2019-04-18 10:33:20
 */

const Router = require('koa-router');

// 工具
const {checkParams} = require('./utils/api_util');
//状态码
const code = require('./utils/statusCode');

//引入封装好的邮箱
const sendMail = require('../api/utils/mail');
//引入封装好的redis
const redisHelper = require('../api/utils/redis');

const router = new Router({
    prefix:'/sendMail'
});


/**
 * @name: 发送邮件接口
 * @param {type} 
 * @returns: 
 */
router.post('/code',async(ctx,next)=>{
    let {
        toMail,
    } = ctx.request.body;

    let params = {
        toMail,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const checkEmail = (text)=>{  
        if(text.match(/qq\.com$/)){
            return -1;
        }
        if(!text.match(/^\w+([._-]\w+)*@(\w+\.)+\w+$/)){
            return false;
        }
        return true;
    }

    if(!checkEmail(params.toMail)){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('邮箱格式错误');
    }

    //随机生成6位数字
    const createSixNum = () => {
        var Num="";
        for(var i=0;i<6;i++)
        {
            Num+=Math.floor(Math.random()*10);
        }
        return Num;
    };
    let codeNum = createSixNum();

    //发送邮件内容
    let mailOptions = {
        to: params.toMail, // list of receivers
        subject: '【麻球科技】邮箱验证码通知', // Subject line
        text: '验证码:'+ codeNum, // plain text body
        html: '<p>您的验证码是:'+ codeNum+',请勿告诉他人,30分钟内有效</p>' // html body
    };

    //发送邮箱
    await sendMail(mailOptions);

    //将邮箱验证码保存到redis中
    redisHelper.setString(params.toMail,codeNum,60 * 5).then((res)=>{
        console.log('设置成功')
    }).catch((err=>{
        console.log('设置失败',err)
    }));

    ctx.response.status = 200;
    ctx.body = code.SUCCESS_200('邮件发送成功,5分钟内有效');
})

module.exports = router;