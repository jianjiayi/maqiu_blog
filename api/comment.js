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
const { User,Comment,CommentReply,Praise } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/comment'
});

/**
 * @name: 创建一条评论
 * @param {type} 
 * @returns: 
 */

 router.post('/create',async(ctx,next)=>{
    let {
        id,
        content,
    } = ctx.request.body;

    let params = {
        id,
        content,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try{
        const { id } = await Comment.create({
            topic_id:params.id,
            content_text:params.content,
            formUid:userId,
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建评论成功',{id});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建评论失败');
    }
 })

/**
 * @name: 获取文章评论列表
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

    const user = await getUserId(ctx);
    let userId = '';
    if(user){
        userId = user.id;
    }

    try{
        const data = await Comment.findAndCountAll({
            limit:10,//每页10条
            offset:(page -1)*10,
            where:{
                topic_id:id,
                isDel:1,
            },
            attributes:{
                exclude: ['isDel','topic_id']
            },
            'order':[
                ['id','DESC']
            ],
            include:[
                {//获取创建这条评论者信息
                    model:User,
                    as:'formUser',
                    attributes:['id','nickname','head_img'],
                },
                {//获取自己与该条评论点赞关系信息
                    model:Praise,
                    as:'ownPraise',
                    where:{
                        type:2,
                        userId:userId
                    },
                    attributes:['id','type','status'],
                    required: false,
                },
                {//获取评论下的所有回复
                    model:CommentReply,
                    as:'replyList',
                    attributes:[
                        'id','replyType','content_text'
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
                        },
                        {//获取自己与该条评论回复点赞关系信息
                            model:Praise,
                            as:'ownPraise',
                            where:{
                                type:3,
                                userId:userId
                            },
                            attributes:['id','type','status'],
                            required: false,
                        },
                    ]
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
