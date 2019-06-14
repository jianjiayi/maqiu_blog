/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-08 10:11:41
 * @LastEditTime: 2019-04-18 10:32:56
 */
const Router = require('koa-router');

// 工具
const { getUserId, checkParams,checkPermise } = require('./utils/api_util');
//状态码
const code = require('./utils/statusCode');
//模型
const { ContentSort } = require('../dbs/models/index');


const router = new Router({
    prefix: '/sort'
});


/**
 * @name: 创建分类
 * @param {type} 
 * @returns: 
 */

router.post('/create', async (ctx, next) => {
    const {
        pcode,
        name,
        icon,
        outlink
    } = ctx.request.body;

    let params = {
        pcode,
        name,
    }

    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;


    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    const user = await getUserId(ctx);
    const userId = user.id;
    //查询是否有已创建该分类
    const eSort = await ContentSort.findOne({
        where: {
            pcode: params.pcode,
            name: params.name,
        }
    });
    if (eSort) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该分类已创建');
        return;
    }

    try {
        await ContentSort.create({
            pcode: params.pcode,
            name: params.name,
            icon: params.icon,
            outlink: params.outlink,
            createUserId: userId,
        })

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建分类成功');
    } catch (err) {
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建分类失败');
    }

})

/**
 * @name: 修改某个分类状态以及其所有子分类状态
 * @param {type} 
 * @returns: 
 */
router.post('/modifyState', async (ctx, next) => {
    const {
        id,
        status
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

    //修改搜有子分类
    const func= async(id,status)=>{
        let List = await ContentSort.findAll({
            attributes: ['id', 'pcode', 'name', 'status', 'sorting'],
            where: {
                pcode:id
            }
        }); 
        if(List.length!=0){
            await ContentSort.update({
                status: status,
            }, {
                where: {
                    pcode:id
                }
            });
            List.map(async(item)=>{
                await ContentSort.update({
                    status: status,
                }, {
                    where: {
                        pcode: item.id
                    }
                });
                func(item.id,item.status=='1'?'0':'1');
            })
        }
    }

    try {
        //修改该分类状态
        await ContentSort.update({
            status: params.status,
        }, {
            where: {
                id: params.id
            }
        });
        func(params.id,params.status);

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('分类状态修改成功');
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('分类状态修改失败');
    }
});


/**
 * @name: 修改某分类排序
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

    //查询分类是否存在
    const eSort = await ContentSort.findOne({
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
        await ContentSort.update({
            sorting:sorting
        }, {
                where: {
                    id: params.id,
                }
            });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('分类排序修改成功');
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('分类排序修改失败');
    }
});

/**
 * @name: 修改某分类信息
 * @param {type} 
 * @returns: 
 */
router.post('/update', async (ctx, next) => {
    const {
        id,
        name,
        pcode,
        outlink,
    } = ctx.request.body;

    let params = {
        id,
        name,
        pcode,
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;


    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    //查询分类是否存在
    const eSort = await ContentSort.findOne({
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
        await ContentSort.update({
            name: params.name,
            pcode: params.pcode,
            outlink: params.outlink,
        }, {
                where: {
                    id: params.id,
                }
            });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('分类修改成功');
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('分类修改失败');
    }
});

/**
 * @name: 获取分类列表
 * @param {id} //id==0顶级节点
 * @returns: 
 */
router.post('/list', async (ctx, next) => {
    const {
        pcode,
        status,
    } = ctx.request.body;

    let params = {
        pcode,
        status
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    if(pcode != 0){
        //查询分类是否存在
        const eSort = await ContentSort.findOne({
            where: {
                pcode: params.pcode,
            }
        })
        if (!eSort) {
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('该分类id不存在');
            return;
        }
    }

    let where = params.pcode == 0 ?
     { status : params.status } : { pcode : params.pcode, status : params.status };

    try {
        const List = await ContentSort.findAll({
            attributes: ['id', 'pcode', 'name', 'status', 'sorting'],
            where: where
        });

        //降序排列函数
        let compare = (property) => {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];
                return value2 - value1;
            }
        }

        //寻找子节点
        const findChild = (arr) => {//arr:顶级节点，List:所有子节点
            arr.map(e => {
                let chilaArr = List.filter((c) => {
                    return e.dataValues.id == c.dataValues.pcode
                });
                //如果没有子节点跳过，遍历下一个元素
                if (chilaArr.length == 0) return;
                //排序
                chilaArr.sort(compare('sorting'))
                e.dataValues.children = chilaArr;

                //递归查询是否有子节点
                findChild(chilaArr, List);
            })
            return arr;
        }

        let listData = [];
        if (List.length != 0) {
            //过滤顶级pcode==id下的分类。id==0为顶级分类
            let parentArr = List.filter((n) => {
                return n.pcode == params.pcode
            });

            //排序
            parentArr.sort(compare('sorting'))

            listData = findChild(parentArr);
        }


        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取分类列表成功', { listData });
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取分类列表失败');
    }
});



module.exports = router;

