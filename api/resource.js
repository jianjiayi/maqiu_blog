/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-10 17:54:28
 * @LastEditTime: 2019-04-18 10:32:48
 */

const Router = require('koa-router');

//sequelize事物
const db_common = require('../dbs/db_common');
//模型工具
const Op = require('../dbs/until');

// 工具
const { getUserId,checkParams,checkPermise } = require('./utils/api_util');
//状态码
const code = require('./utils/statusCode');
//模型
const { User,Role,UserRole,Resource,ResourceRole } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/resource'
});

/**
 * @name: 创建权限
 * @param {type} 
 * @returns: 
 */

 router.post('/create',async(ctx,next)=>{
    let {
        level,
        name,
        description,
    } = ctx.request.body;

    let params = {
        level,
        name,
        description,
    }
    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const user = await getUserId(ctx);
    if(user.roles!=0){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('只有超级管理员才有相关权限');
        return;
    }

    const userId = user.id;

    try{
        const { id } = await Resource.create({
            level:params.level,
            name:params.name,
            description:params.description,

            createUserId:userId,//创建者
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建权限成功',{id});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建权限失败');
    }
 })

 /**
 * @name: 修改权限状态
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

    //校验是否有相关权限
    const user = await getUserId(ctx);
    if(user.roles!=0){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('只有超级管理员才有相关权限');
        return;
    }

    const userId = user.id;

    try{
        await Resource.update({
            isDel:params.status,
        },{
            where:{
                id:id,
            }
        });
        
        if(status==0){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('权限注销成功');
        }else if(status==1){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('权限启动成功');
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
 * @name: 更新权限
 * @param {type} 
 * @returns: 
 */
router.post('/update',async(ctx,next)=>{
    let {
        id,//id
        level,
        name,
        description,
    } = ctx.request.body;

    let params = {
        id,
        level,
        name,
        description,
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    //校验是否有相关权限
    const user = await getUserId(ctx);
    if(user.roles!=0){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('只有超级管理员才有相关权限');
        return;
    }

    try{
        await Resource.update({
            name:params.name,
            level:params.level,
            name:params.name,
            description:params.description,
        },{
            where:{
                id:params.id,
            }
        });
        
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('权限更新成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('权限更新失败');
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
    const user = await getUserId(ctx);
    if(user.roles!=0){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('只有超级管理员才有相关权限');
        return;
    }

    //查询链接是否存在
    const eSort = await Resource.findOne({
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
        await Permission.update({
            sorting:sorting
        }, {
                where: {
                    id: params.id,
                }
            });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('排序修改成功');
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('链接排序修改失败');
    }
});

/**
 * @name: 获取用户路由权限
 * @param {type} 
 * @returns: 
 */
router.get('/getRoutes', async (ctx, next) => {
    const user = await getUserId(ctx);
    const userId = user.id;
    const t = await db_common.transaction();
    //获取用户信息
    try {
        //获取用户所有的角色
        const roles = await UserRole.findAll({
            where: {
                userId: userId
            },
            attributes: ['roleId'],
            raw:true
        });
        console.log(roles);
        // //生成可用角色数组
        let roleArray = [];
        roles.map((role)=>{
            roleArray.push(role.roleId)
        })
        //获取角色对应的权限
        const resourceIds = await ResourceRole.findAll({
            where:{
                roleId : {
                    [Op.in]:roleArray
                }
            },
            attributes: ['resourceId'],
            raw:true
        });
        //生成权限数组
        let resourceArray = [];
        resourceIds.map((resource)=>{
            resourceArray.push(resource.resourceId)
        })
        //获取用户所有路由权限
        const routeList = await Resource.findAll({
            where:{
                id:resourceArray,
                type:'view',
            },
            attributes: ['code','parent_code','name','path','icon',],
            raw:true
        });
        
        //寻找子节点
        const findChild = (arr,List) => {//arr:顶级节点，List:所有子节点
            arr.map(e => {
                let chilaArr = List.filter((c) => {
                    return e.code == c.parent_code
                });
                //如果没有子节点跳过，遍历下一个元素
                if (chilaArr.length == 0) return;

                e.children = chilaArr;

                //递归查询是否有子节点
                findChild(chilaArr, List);
            })
            return arr;
        }
        let listData = [];
        if (routeList.length != 0) {
            //获取顶级路由
            const parentRouters = routeList.filter(item=>{
                return  item.parent_code == '';
            })

            listData = findChild(parentRouters,routeList);
        }

        let list = {
            sliderMenus:listData,
            routerList:routeList
        }

        await t.commit();

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取用户路由权限成功', { list });

    } catch (err) {
        await t.rollback();
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取用户路有权限失败');
    }
})

/**
 * @name: 获取权限列表
 * @param {type} 
 * @returns: 
 */
router.post('/list',async(ctx,next)=>{
    let {
        status = [0,1]
    } = ctx.request.body;
    
    try{
        const resourceList = await Resource.findAll({
            attributes: ['id','code','parent_code','name','icon','type'],
            raw:true
        });

        //寻找子节点
        const findChild = (arr,List) => {//arr:顶级节点，List:所有子节点
            arr.map(e => {
                let chilaArr = List.filter((c) => {
                    return e.code == c.parent_code
                });
                //如果没有子节点跳过，遍历下一个元素
                if (chilaArr.length == 0) return;

                e.children = chilaArr;

                //递归查询是否有子节点
                findChild(chilaArr, List);
            })
            return arr;
        }
        let listData = [];
        if (resourceList.length != 0) {
            //获取顶级路由
            const parentRouters = resourceList.filter(item=>{
                return  item.parent_code == '';
            })

            listData = findChild(parentRouters,resourceList);
        }

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取列表成功',{listData});
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取列表失败',err);
    }
    
})

module.exports = router;
