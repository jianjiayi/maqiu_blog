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
const { Role,Resource,ResourceRole } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/role'
});

/**
 * @name: 创建角色
 * @param {type} 
 * @returns: 
 */

 router.post('/create',async(ctx,next)=>{
    let {
        role_name,
        role_desc,
        role_Resource=[]
    } = ctx.request.body;

    let params = {
        role_name,
        role_desc,
        role_Resource
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

    const t = await db_common.transaction();

    try{

        const { id } = await Role.create({
            role_name:params.role_name,
            role_desc:params.role_desc,
        });
        let resourceArray=[];
        params.role_Resource.map((item)=>{
            resourceArray.push({
                roleId : id,
                resourceId:item
            })
        })
        //批量插入权限资源
        await ResourceRole.bulkCreate(resourceArray);

        await t.commit();

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建角色成功',{id});
    }catch(err){
        await t.rollback();
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建角色失败');
    }
 })

 /**
 * @name: 修改角色状态
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
    const user = await getUserId(ctx);
    if(user.roles!=0){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('只有超级管理员才有相关权限');
        return;
    }

    try{
        await Role.update({
            isDel:params.status,
        },{
            where:{
                id:id,
            }
        });
        
        if(status==0){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('角色注销成功');
        }else if(status==1){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('角色启动成功');
        }else{
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('角色操作成功');
        }
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('状态修改失败');
    }
});

/**
 * @name: 更新角色
 * @param {type} 
 * @returns: 
 */
router.post('/update',async(ctx,next)=>{
    let {
        id,//id
        role_name,
        role_desc,
        role_Resource=[]
    } = ctx.request.body;

    let params = {
        id,
        role_name,
        role_desc,
        role_Resource
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

    const t = await db_common.transaction();

    try{
        //修改角色信息
        await Resource.update({
            role_name:params.role_name,
            level:params.level,
            role_desc:params.role_desc,
        },{
            where:{
                id:params.id,
            },
        });

        //修改角色拥有权限信息
        await ResourceRole.destroy({
            where:{
                roleId : id,
            },
        });

        let resourceArray=[];
        params.role_Resource.map((item)=>{
            resourceArray.push({
                roleId : id,
                resourceId:item
            })
        });
        //批量插入权限资源
        await ResourceRole.bulkCreate(resourceArray);

        await t.commit();
        
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('权限更新成功');
    }catch(err){
        await t.rollback();
        console.log(err);

        ctx.response.status = 412;
        ctx.body = code.ERROR_412('权限更新失败');
    }
});


/**
 * @name: 获取角色列表
 * @param {type} 
 * @returns: 
 */
router.post('/list',async(ctx,next)=>{

    const t = await db_common.transaction();

    //获取角色列表
    try {
        const list = await Role.findAll({
            attributes: ['id','role_name'],
            distinct:true
        });

        await t.commit();

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取列表成功', { list });

    } catch (err) {
        await t.rollback();
        console.log(err)

        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取列表失败');
    }
})


/**
 * @name: 获取角色权限列表
 * @param {type} 
 * @returns: 
 */
router.post('/resourceList',async(ctx,next)=>{
    let {
        page = 1,
    } = ctx.request.body;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    const t = await db_common.transaction();

    //获取角色列表
    try {
        const data = await Role.findAndCountAll({
            limit: 10,//每页10条
            offset: (page - 1) * 10,
            include:[
                {//权限信息
                    model:Resource,
                    as:'role_Resource',
                    attributes:['id'],
                    required: true,
                },
            ],
            distinct:true
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

        await t.commit();


        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取列表成功', { list });

    } catch (err) {
        await t.rollback();
        console.log(err)

        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取列表失败');
    }
})

module.exports = router;
