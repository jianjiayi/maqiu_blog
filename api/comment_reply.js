/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-11 11:03:33
 * @LastEditTime: 2019-04-12 10:39:09
 */


const Router = require('koa-router');

// 工具
const { getUserId,checkParams,checkPermise } = require('./utils/CheckPermise');
//状态码
const code = require('./utils/statusCode');
//模型
const { User,CommentReply } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/commentReply'
});

/**
 * @name: 创建一条回复
 * @param {type} 
 * @returns: 
 */

 router.post('/create',async(ctx,next)=>{
    let {
        replyId,//回复评论id
        replyType,//回复的类型，0回复评论，1回复回复
        toUid,//目标用户uid
        content,//回复内容
    } = ctx.request.body;

    let params = {
        replyId,
        replyType,
        toUid,
        content,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try{
        const { id } = await CommentReply.create({
            replyId:params.replyId,
            replyType:params.replyType,
            toUid:params.toUid,
            content_text:params.content,
            formUid:userId,
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建回复评论成功',{id});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建回复评论失败');
    }
 })

/**
 * @name: 获取评论下的所有回复
 * @param {type} 
 * @returns: 
 */
router.post('/list',async(ctx,next)=>{
    let {
        page = 1,
        id,
    } = ctx.request.body;

    let params = {
        page,
        id,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    try{
        const data = await CommentReply.findAndCountAll({
            limit:10,//每页10条
            offset:(page -1)*10,
            where:{
                replyId:id,
                isDel:1,
            },
            attributes:{
                exclude: ['formUid','toUid','isDel']
            },
            'order':[
                ['id','DESC']
            ],
            include:[
                {//回复用户信息
                    model:User,
                    as:'formUser',
                    attributes:['id','nickname','head_img'],
                },
                {//目标用户者信息
                    model:User,
                    as:'toUser',
                    attributes:['id','nickname','head_img'],
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
        ctx.body = code.SUCCESS_200('获取评论列表成功',{list});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取评论列表失败');
    }
})

module.exports = router;
