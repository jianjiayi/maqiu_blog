/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-11 16:29:50
 * @LastEditTime: 2019-04-12 13:50:19
 */

const Router = require('koa-router');

// 工具
const { getUserId,checkParams,checkPermise } = require('./utils/CheckPermise');
//状态码
const code = require('./utils/statusCode');
//模型
const { User,Content,Comment,CommentReply,Praise } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/Praise'
});

/**
 * @name: 创建一条点赞记录
 * @param {type} 
 * @returns: 
 */

 router.post('/operation',async(ctx,next)=>{
    let {
        typeId,//作品、评论、回复评论的id
        type,//1作品点赞，2评论点赞，3回复点赞
    } = ctx.request.body;

    let params = {
        typeId,
        type,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    //查询是否创建过点赞记录
    const ePraise = await Praise.findOne({
        where:{
            typeId:params.typeId,
            type:params.type,
            userId:userId
        }
    });
    if(ePraise){//存在点赞记录
        try{
            
            let praise_status = null;
            //判断原有记录中的点赞状态
            ePraise.status == 0 ? praise_status =1 : praise_status = 0;
            //修改点赞状态 0取消点赞  1点赞
            await Praise.update({
                status:praise_status,
            },{
                where:{
                    typeId:params.typeId,
                    type:params.type,
                    userId:userId,
                }
            });
            if(praise_status==0){
                ctx.response.status = 200;
                ctx.body = code.SUCCESS_200('取消点赞成功',{praise_status});
            }else{
                ctx.response.status = 200;
                ctx.body = code.SUCCESS_200('点赞成功',{praise_status});
            }

        }catch(err){
            console.log(err)
            
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('修改点赞状态失败');
        }
    }else{
        //获取要点赞对象的创建者id
        let toUId = null;
        if(params.type==1){
            const { createUserId } = await Content.findOne({
                where:{
                    id:typeId
                }
            })
            toUId = createUserId
        }
        if(params.type==2){
            const { formUid } = await Comment.findOne({
                where:{
                    id:typeId
                }
            })
            toUId = formUid
        }
        if(params.type==3){
            const { formUid } = await CommentReply.findOne({
                where:{
                    id:typeId
                }
            })
            toUId = formUid
        }
        //创建一条点赞记录
        try{
            const { id } = await Praise.create({
                typeId:params.typeId,
                type:params.type,
                userId:userId,
                toUserId:toUId
            });

            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('创建点赞记录成功',{id});
        }catch(err){
            console.log(err)
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('创建点赞记录失败');
        }
    }
});

/**
 * @name: 根据用户userId获取点赞记录
 * @param {type} 
 * @returns: 
 */
router.post('/ownAllPraiseList',async(ctx,next)=>{
    let {
        page = 1
    } = ctx.request.body;

    let params = {
        page,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try{
        const data = await Praise.findAndCountAll({
            limit:10,//每页10条
            offset:(page -1)*10,
            where:{
                toUserId:userId
            },
            attributes:['id','typeId','userId','type'],
            'order':[
                ['id','DESC']
            ],
            include:[
                {//获取点赞这信息信息
                    model:User,
                    as:'praiseUserInfo',
                    attributes:['nickname','head_img'],
                },
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
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取列表失败',err);
    }
})

/**
 * @name: 根据文章id获取点赞记录
 * @param {type} 
 * @returns: 
 */
router.get('/contentAllPraiseList',async(ctx,next)=>{
    //文章id
    let { id,} = ctx.query;

    let params = {
        id,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    try{
        const data = await Praise.findAndCountAll({
            limit:10,//最多取10条
            where:{
                typeId:id,
                type:1,//文章
                status:1
            },
            attributes:['id','userId'],
            'order':[
                ['id','DESC']
            ],
            include:[
                {//创建者信息
                    model:User,
                    as:'praiseUserInfo',
                    attributes:['nickname','head_img'],
                },
            ],
        });

        const list = {
            data: data.rows,//数据
            count: data.count,//总条数
        }
        

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取点赞列表成功',{list});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取点赞列表失败');
    }
})

module.exports = router;
