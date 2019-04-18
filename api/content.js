/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-08 10:11:51
 * @LastEditTime: 2019-04-18 10:33:06
 */
const Router = require('koa-router');

// 工具
const { getUserId,checkParams,checkPermise } = require('./utils/api_util');
//状态码
const code = require('./utils/statusCode');
//模型
const { User,Content,ContentSort } = require ('../dbs/models/index');


const router = new Router({
    prefix:'/content'
});


/**
 * @name: 创建详情
 * @param {type} 
 * @returns: 
 */
router.post('/create',async(ctx,next)=>{
    let {
        contentSortId,//栏目编号**
        title,//标题**
        subtitle,//副标题**
        author,//作者**
        source,//来源
        outlink,//外部链接
        date,//发布日期**
        pics,//缩略图**
        content,//详情
        tags,//关键字
        description,//描述
        keywords,//关键词
    } = ctx.request.body;

    let params = {
        contentSortId,//栏目编号**
        title,//标题**
        subtitle,//副标题**
        author,//作者**
        date,//发布日期**
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    // 检查用户是否创建了该分类
    const eSort = await ContentSort.findOne({
        where:{
            id:params.contentSortId,
            createUserId:userId
        }
    })
    if(!eSort){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该分类id不存在，请先创建分类');
        return;
    }

    const getimgsrc=(htmlstr)=>{  
        var reg = /<img.+?src=('|")?([^'"]+)('|")?(?:\s+|>)/gim;  
        var imgsrcArr = [];  
        while (tem = reg.exec(htmlstr)) {  
            imgsrcArr.push(tem[2]);  
        }  
        return imgsrcArr.join(',');  
    }
    pics += getimgsrc(content);

    try{
        //创建文章获取刚创建文章的id
        const {id} = await Content.create({
            contentSortId:params.contentSortId,//栏目编号**
            title:params.title,//标题**
            subtitle:params.subtitle,//副标题**
            author:params.author,//作者**
            release_date:params.date,//发布日期**

            pics:pics,//缩略图
            source:source,//来源
            outlink:outlink,//外部链接
            content:content,//详情
            tags:tags,//关键字
            description:description,//描述
            keywords:keywords,//关键词

            createUserId:userId,//创建者
        })

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('创建成功',{id});

    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('创建失败');
    }
});

/**
 * @name: 修改详情状态
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
    //获取用户登录信息
    const user = await getUserId(ctx);

    try{
        await Content.update({
            status:params.status,
        },{
            where:{
                id:id,
                createUserId:user.id,
            }
        });
        
        if(status==0){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('操作下架成功');
        }else if(status==1){
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('操作上架成功');
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
 * @name: 更新详情
 * @param {type} 
 * @returns: 
 */
router.post('/update',async(ctx,next)=>{
    let {
        id,//文章id
        contentSortId,//栏目编号**
        title,//标题**
        subtitle,//副标题**
        author,//作者**
        source,//来源
        outlink,//外部链接
        date,//发布日期**
        pics,//缩略图**
        content,//详情
        tags,//关键字
        description,//描述
        keywords,//关键词
    } = ctx.request.body;

    let params = {
        id,
        contentSortId,//栏目编号**
        title,//标题**
        subtitle,//副标题**
        author,//作者**
        date,//发布日期**
    }

    // 检测参数是否存在为空
    if(!checkParams(ctx,params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    const getimgsrc=(htmlstr)=>{  
        var reg = /<img.+?src=('|")?([^'"]+)('|")?(?:\s+|>)/gim;  
        var imgsrcArr = [];  
        while (tem = reg.exec(htmlstr)) {  
            imgsrcArr.push(tem[2]);  
        }  
        return imgsrcArr.join(',');  
    }
    pics += getimgsrc(content);

    try{
        await Content.update({
            contentSortId:params.contentSortId,//栏目编号**
            title:params.title,//标题**
            subtitle:params.subtitle,//副标题**
            author:params.author,//作者**
            release_date:params.date,//发布日期**

            pics:pics,//缩略图
            source:source,//来源
            outlink:outlink,//外部链接
            content:content,//详情
            tags:tags,//关键字
            description:description,//描述
            keywords:keywords,//关键词

        },{
            where:{
                id:params.id,
                createUserId:userId
            }
        });
        
        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('文章更新成功');
    }catch(err){
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('文章更新失败');
    }
});

/**
 * @name: 获取列表
 * @param {type} //page要查询页数，先判断是否为管理员，若为管理员则查询所有文章，否则判断
 * userId是否为空，若为空，查询自己文正列表，否则查询userid文章列表
 * @returns: 
 */
router.post('/list',async(ctx,next)=>{
    let {
        page = 1,
        userId,//为空就是获取自己发布的用户列表，否则获取其他人的文章列表
        contentSortId,//scode不传或者为空，查询所有分类下的，否则查询该分类下的
        status,//status不传穿或者为空，查询所有状态下的；当userid!=''&&不是管理员，时只查询status==1的状态文章列表
    } = ctx.request.body;



    //查询条件
    let whereObj = {};
    //添加查询状态
    (status === '' || status === undefined) ? '' : (whereObj.status = status);
    //添加查询分类
    (contentSortId ==='' || contentSortId === undefined) ? '' : (whereObj.contentSortId = contentSortId);

    //校验是否有相关权限,及判断是否为管理员
    const is_admin = await checkPermise(ctx);
    //不是管理员
    if(!is_admin){
        //获取用户登录信息
        const user = await getUserId(ctx);
        const user_id = user.id;

        if(userId != '' && userId != undefined){//查询其他人的文章

            whereObj.createUserId = userId;
            if(userId != user_id){
                whereObj.status = 1
            }
        }
    }

    try{
        const data = await Content.findAndCountAll({
            limit:10,//每页10条
            offset:(page -1)*10,
            where:whereObj,
            attributes:['title','subtitle','author','release_date','pics'],
            'order':[
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
});

/**
 * @name: 获取详情
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
        const detail = await Content.findOne({
            where:{
                id:params.id,
            },
            attributes:{
                exclude: ['contentSortId','createUserId']
            },
            include:[
                {//分类信息
                    model:ContentSort,
                    as:'contentSortInfo',
                    attributes:{
                        exclude: ['createdAt','updatedAt','createUserId']
                    },
                },
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
            ctx.body = code.ERROR_401('该文章不存在');   
        }
    }catch(err){
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取详情失败',err);   
    }
});

module.exports = router;