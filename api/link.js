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
const { User,Link } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/link'
});

/**
 * @name: 创建链接
 * @param {type} 
 * @returns: 
 */

 router.post('/create',async(ctx,next)=>{
    let {
        gid,
        name,
        link,
        logo,
    } = ctx.request.body;

    let params = {
        gid,
        name,
        link,
        logo,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try{
        const { id } = await Link.create({
            gid:params.gid,
            name:params.name,
            link:params.link,
            logo:params.logo,

            createUserId:userId,//创建者
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建链接成功',{id});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建链接失败');
    }
 })

 /**
 * @name: 修改链接状态
 * @param {type} 
 * @returns: 
 */
router.post('/modifyState',async(ctx,next)=>{
    const {
        id,
        status,
    } = ctx.request.body;

    let params = {
        id,
        status
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    try{
        await Link.update({
            isDel:params.status,
        },{
            where:{
                id:id,
            }
        });
        
        if(status==0){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('链接注销成功');
        }else if(status==1){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('链接启动成功');
        }else{
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('其他操作成功');
        }
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('状态修改失败');
    }
});

/**
 * @name: 更新链接
 * @param {type} 
 * @returns: 
 */
router.post('/update',async(ctx,next)=>{
    let {
        id,//文章id
        name,
        link,
        logo,
    } = ctx.request.body;

    let params = {
        id,
        name,
        link,
        logo
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;


    try{
        await Link.update({
            name:params.name,
            link:params.link,
            logo:params.logo,
            gid:params.gid,
        },{
            where:{
                id:params.id,
            }
        });
        
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('链接更新成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('链接更新失败');
    }
});


/**
 * @name: 修改链接排序
 * @param {type} 0：置顶设置为999，1：上移不断加1，-1：下移不断减1
 * @returns: 
 */
router.post('/setSorting', async (ctx, next) => {
    const {
        id,
        sort
    } = ctx.request.body;

    let params = {
        id,
        sort
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

     //校验是否有相关权限
     const is_admin = await checkPermise(ctx);
     if (!is_admin) return;

    //查询链接是否存在
    const eSort = await Link.findOne({
        where: {
            id: id,
        }
    });
    if (!eSort) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该分类id不存在');
        return;
    }

    //修改分类信息
    try {
        let sorting = eSort.sorting;
        switch(params.sort){
            case '0':
                sorting = 999;
                break;
            case '1':
                sorting = sorting+1;
                break;
            case '-1':
                sorting = sorting-1;
                break;
            default:
                return;
        }
        await Link.update({
            sorting:sorting
        }, {
                where: {
                    id: params.id,
                }
            });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('链接排序修改成功');
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('链接排序修改失败');
    }
});

/**
 * @name: 获取链接列表
 * @param {type} 
 * @returns: 
 */
router.post('/list',async(ctx,next)=>{
    let {
        page = 1,
        gid = 0,
        status = [0,1]
    } = ctx.request.body;
    
    try{
        const data = await Link.findAndCountAll({
            limit:10,//每页10条
            offset:(page -1)*10,
            where:{
                gid : gid,
                isDel :status,
            },
            'order':[
                ['sorting','DESC'],
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

        const list = {
            data: data.rows,//分页数据
            meta: {
                current_page: parseInt(page),//当前页数
                per_page: 10,//每页数据条数
                count: data.count,//总条数
                total_pages: Math.ceil(data.count / 10),//总页数
            }
        }
        

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取列表成功',{list});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取列表失败',err);
    }
    
})

module.exports = router;
