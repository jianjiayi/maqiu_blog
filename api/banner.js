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
const { User,Banner } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/banner'
});

/**
 * @name: 创建幻灯片
 * @param {type} 
 * @returns: 
 */

 router.post('/create',async(ctx,next)=>{
    let {
        gid,
        title,
        subtitle,
        pic,
        link
    } = ctx.request.body;

    let params = {
        gid,
        title,
        subtitle,
        pic,
        link
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try{
        const { id } = await Banner.create({
            gid:params.gid,
            title:params.title,
            subtitle:params.subtitle,
            pic:params.pic,
            link:params.link,

            createUserId:userId,//创建者
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建幻灯片成功',{id});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建幻灯片失败');
    }
 })

 /**
 * @name: 修改幻灯片状态
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
        await Banner.update({
            isDel:params.status,
        },{
            where:{
                id:id,
            }
        });
        
        if(status==0){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('幻灯片注销成功');
        }else if(status==1){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('幻灯片启动成功');
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
 * @name: 更新幻灯片
 * @param {type} 
 * @returns: 
 */
router.post('/update',async(ctx,next)=>{
    let {
        id,//文章id
        title,
        subtitle,
        pic,
        gid,
        link,
    } = ctx.request.body;

    let params = {
        id,//文章id
        title,
        subtitle,
        pic,
        link,
        gid
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;


    try{
        await Banner.update({
            title:params.title,
            link:params.link,
            pic:params.pic,
            gid:params.gid,
            subtitle:params.subtitle
        },{
            where:{
                id:params.id,
            }
        });
        
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('幻灯片更新成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('幻灯片更新失败');
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
    const eSort = await Banner.findOne({
        where: {
            id: id,
        }
    });
    if (!eSort) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该幻灯片id不存在');
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
        await Banner.update({
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
        const data = await Banner.findAndCountAll({
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
