/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 17:54:28
 * @LastEditTime: 2019-04-18 10:32:48
 */

const Router = require('koa-router');

const moment = require('moment');

//sequelize事物
const db_common = require('../dbs/db_common');
//模型工具
const Op = require('../dbs/until');

// 工具
const { getUserId, checkParams, checkPermise } = require('./utils/api_util');
//状态码
const code = require('./utils/statusCode');
//模型
const { User, Message } = require('../dbs/models/index');


const router = new Router({
    prefix: '/message'
});

/**
 * @name: 创建公告
 * @param {type} 
 * @returns: 
 */

router.post('/create', async (ctx, next) => {
    let {
        gid,
        title,
        subtitle,
        startTime,
        endTime,
        tags,
        description,
        keywords,
        content
    } = ctx.request.body;

    let params = {
        gid,
        title,
        subtitle,
        startTime,
        endTime,
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try {
        const { id } = await Message.create({
            gid: params.gid,
            title: params.title,
            subtitle: params.subtitle,
            startTime: params.startTime,
            endTime: params.endTime,
            tags: tags,
            description:description,
            keywords:keywords,
            content:content,

            createUserId: userId,//创建者
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建公告成功', { id });
    } catch (err) {
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建公告失败');
    }
})

/**
* @name: 修改公告状态
* @param {type} 
* @returns: 
*/
router.post('/modifyState', async (ctx, next) => {
    const {
        id,
        status,
    } = ctx.request.body;

    let params = {
        id,
        status
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;



    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    try {
        await Message.update({
            status: params.status,
        }, {
                where: {
                    id: id,
                }
            });

        if (status == 0) {
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('公告注销成功');
        } else if (status == 1) {
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('公告启动成功');
        } else {
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('其他操作成功');
        }
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('状态修改失败');
    }
});

/**
 * @name: 更新公告
 * @param {type} 
 * @returns: 
 */
router.post('/update', async (ctx, next) => {
    let {
        id,//id
        gid,
        title,
        subtitle,
        startTime,
        endTime,
        tags,
        description,
        keywords,
        content
    } = ctx.request.body;

    let params = {
        id,
        gid,
        title,
        subtitle,
        startTime,
        endTime,
    }

    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;


    try {
        await Message.update({
            gid: params.gid,
            title: params.title,
            subtitle: params.subtitle,
            startTime: params.startTime,
            endTime: params.endTime,
            tags: tags,
            description:description,
            keywords:keywords,
            content:content,
        }, {
                where: {
                    id: params.id,
                }
            });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('公告更新成功');
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('公告更新失败');
    }
});


/**
 * @name: 修改公告排序
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
    const eSort = await Message.findOne({
        where: {
            id: id,
        }
    });
    if (!eSort) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该公告id不存在');
        return;
    }

    //修改分类信息
    try {
        let sorting = eSort.sorting;
        switch (params.sort) {
            case '0':
                sorting = 999;
                break;
            case '1':
                sorting = sorting + 1;
                break;
            case '-1':
                sorting = sorting - 1;
                break;
            default:
                return;
        }
        await Link.update({
            sorting: sorting
        }, {
                where: {
                    id: params.id,
                }
            });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('公告排序修改成功');
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('公告排序修改失败');
    }
});

/**
 * @name: 获取有效公告列表
 * @param {type} 
 * @returns: 
 */
router.post('/list', async (ctx, next) => {
    let {
        page = 1,
        type = 1,
        gid = 0,
        status = [0, 1]
    } = ctx.request.body;

    let where = {
        gid:gid,
        status :status,
    }

    if(type == 1){//获取有效的公告列表
        // where.startTime = {
        //     [Op.lte]: moment(new Date()).valueOf()              // 小于当前时间戳
        // };
        where.endTime = {
            [Op.gte]: moment(new Date()).valueOf()              // 大于当前时间戳
        }
    }

    try {
        const data = await Message.findAndCountAll({
            limit: 10,//每页10条
            offset: (page - 1) * 10,
            where: where,
            'order': [
                ['sorting', 'DESC'],
                ['id', 'DESC']
            ],
            include: [
                {//创建者信息
                    model: User,
                    as: 'createUserInfo',
                    attributes: ['id', 'nickname', 'head_img'],
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
        ctx.body = code.SUCCESS_200('获取列表成功', { list });
    } catch (err) {
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取列表失败', err);
    }

})

/**
 * @name: 获取公告详情
 * @param {type} 
 * @returns: 
 */
router.get('/detail',async(ctx,next)=>{
    const {id} = ctx.query;

    let params = {
        id,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    try{
        const detail = await Message.findOne({
            where:{
                id:params.id,
            },
            include:[
                {//创建者信息
                    model:User,
                    as:'createUserInfo',
                    attributes:['id','nickname','head_img'],
                }
            ],
        });
        if(detail){
            if(detail.status==1){
                ctx.response.status = 200;
                ctx.body = code.SUCCESS_200('获取详情成功',{detail});  
            }else{
                ctx.response.status = 412;
                ctx.body = code.ERROR_412('已被删除');   
            }
        }else{
            ctx.response.status = 401;
            ctx.body = code.ERROR_401('该公告不存在');   
        }
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取详情失败',err);   
    }
});

module.exports = router;
