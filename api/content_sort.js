/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-08 10:11:41
 * @LastEditTime: 2019-04-11 12:40:25
 */
const Router = require('koa-router');

// 工具
const { getUserId,checkParams } = require('./utils/CheckPermise');
//状态码
const code = require('./utils/statusCode');
//模型
const { ContentSort } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/sort'
});


/**
 * @name: 创建分类
 * @param {type} 
 * @returns: 
 */

router.post('/create',async(ctx,next)=>{
    const {
        pcode,
        name,
        icon,
        outlink
    } = ctx.request.body;

    let params = {
        pcode,
        name,
        icon,
        outlink
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;
    //查询是否有已创建该分类
    const eSort = await ContentSort.findOne({
        where:{
            pcode:params.pcode,
            name:params.name,
            createUserId:userId
        }
    });
    if(eSort){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该分类已创建');
        return;
    }

    try{
            
        await ContentSort.create({
            pcode:params.pcode,
            name:params.name,
            icon:params.icon,
            outlink:params.outlink,
            createUserId:userId,
        })
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建分类成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建分类失败');
    }

})

/**
 * @name: 修改某个分类状态
 * @param {type} 
 * @returns: 
 */
router.post('/modifyState',async(ctx,next)=>{
    const {
        id,
        status
    } = ctx.request.body;

    let params = {
        id,
        status
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;
    //获取用户登录信息
    const user = await getUserId(ctx);
    try{
        await ContentSort.update({
            status:params.status,
        },{
            where:{
                id:params.id,
                createUserId:user.id,
            }
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('分类状态修改成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('分类状态修改失败');
    }
});

/**
 * @name: 修改某分类信息
 * @param {type} 
 * @returns: 
 */
router.post('/update',async(ctx,next)=>{
    const {
        id,
        name,
        pcode,
        icon,
        outlink,
    } = ctx.request.body;

    let params = {
        id,
        name,
        pcode,
        icon,
        outlink,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;
    //获取用户登录信息
    const user = await getUserId(ctx);

    //查询分类是否存在
    const eSort = await ContentSort.findOne({
        where:{
            id:id,
            createUserId:user.id
        }
    });
    if(!eSort){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该分类id不存在');
        return;
    }

    //修改分类信息
    try{
        await ContentSort.update({
            name:params.name,
            pcode:params.pcode,
            icon:params.icon,
            outlink:params.outlink,
        },{
            where:{
                id:params.id,
                createUserId:user.id,
            }
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('分类修改成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('分类修改失败');
    }
});

/**
 * @name: 获取分类列表
 * @param {id} //id==0顶级节点
 * @returns: 
 */
router.post('/list',async(ctx,next) =>{
    const {
        id,
    } = ctx.request.body;

    let params = {
        id,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;
    //获取用户登录信息
    const user = await getUserId(ctx);

    //查询分类是否存在
    const eSort = await ContentSort.findOne({
        where:{
            pcode:id,
            createUserId:user.id
        }
    })
    if(!eSort){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该分类id不存在');
        return;
    }

    try{
        const List = await ContentSort.findAll({
            attributes: ['id','pcode','name','status'],
            where:{
                createUserId:user.id,
                status:1
            }
        });

        //寻找子节点
        const findChild = (arr)=>{//arr:顶级节点，List:所有子节点
            arr.map(e=>{
                let chilaArr = List.filter((c)=>{
                    return c.pcode == e.dataValues.id
                });
                //如果没有子节点跳过，遍历下一个元素
                if(chilaArr.length==0) return;
                e.dataValues.data = chilaArr;

                //递归查询是否有子节点
                findChild(chilaArr,List);
            })
            return arr;
        }
    
        //过滤顶级pcode==id下的分类。id==0为顶级分类
        let parentArr = List.filter((n)=>{
            return n.pcode == params.id
        });
        let data = findChild(parentArr);
        
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取分类列表成功',{data});
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取分类列表失败');
    }
});



module.exports = router;

