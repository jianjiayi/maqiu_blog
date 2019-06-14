/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 17:54:28
 * @LastEditTime: 2019-04-18 10:32:48
 */

const Router = require('koa-router');

// 工具
const { getUserId,checkParams,checkPermise } = require('./utils/api_util');
//状态码
const code = require('./utils/statusCode');
//模型
const { User,Company } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/company'
});

/**
 * @name: 添加公司信息
 * @param {type} 
 * @returns: 
 */

 router.post('/create',async(ctx,next)=>{
    let {
        name,
        address,
        postcode,
        contact,
        mobile,
        phone,
        fax,
        email,
        qq,
        weixin,
        weixinPic,
        blicense,
        blicensePic
    } = ctx.request.body;

    let params = {
        name,
        address,
        postcode,
        contact,
        mobile,
        phone,
        email,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try{
        const { id } = await Company.create({
            name:params.name,
            address:params.address,
            postcode:params.postcode,
            contact:params.contact,
            mobile:params.mobile,
            phone:params.phone,
            fax:fax,
            email:params.email,
            qq:qq,
            weixin:weixin,
            weixinPic:weixinPic,
            blicense:blicense,
            blicensePic:blicensePic,

            createUserId:userId,//创建者
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建公司信息成功',{id});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建公司信息失败');
    }
 })

 
/**
 * @name: 更新站点信息
 * @param {type} 
 * @returns: 
 */
router.post('/update',async(ctx,next)=>{
    let {
        id,//id
        name,
        address,
        postcode,
        contact,
        mobile,
        phone,
        fax,
        email,
        qq,
        weixin,
        weixinPic,
        blicense,
        blicensePic
    } = ctx.request.body;

    let params = {
        id,
        name,
        address,
        postcode,
        contact,
        mobile,
        phone,
        email,
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;


    try{
        await Company.update({
            name:params.name,
            address:params.address,
            postcode:params.postcode,
            contact:params.contact,
            mobile:params.mobile,
            phone:params.phone,
            fax:fax,
            email:params.email,
            qq:qq,
            weixin:weixin,
            weixinPic:weixinPic,
            blicense:blicense,
            blicensePic:blicensePic,
        },{
            where:{
                id:params.id,
            }
        });
        
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('公司信息更新成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('公司信息更新失败');
    }
});


/**
 * @name: 获取站点信息
 * @param {type} 
 * @returns: 
 */
router.post('/list',async(ctx,next)=>{
    
    try{
        const data = await Company.findAll({
            limit:1,
            'order':[
                ['id','DESC']
            ],
            include:[
                {//创建者信息
                    model:User,
                    as:'createUserInfo',
                    attributes:['id','nickname','head_img'],
                    required: false,
                }
            ],
        });

        let list;
        if(data.length ==0){
            list = {}
        }else{
            list = data[0];
        }
        

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取公司信息成功',{list});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取公司信息失败',err);
    }
    
})

module.exports = router;
