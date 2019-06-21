/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-17 17:01:56
 * @LastEditTime: 2019-04-18 15:38:37
 */

//加密工具
const bcrypt = require('bcryptjs');
//模型
const { User, Role ,UserRole,Resource,ResourceRole} = require('./dbs/models/index');
//admin、秘钥
const { adminConfig } = require('./config/index');

const db_common = require('./dbs/db_common');
/**
 * 程序启动前初始化
 */

const resourceList = [
    /**基础内容 */
    {
        code:'1',
        name:'基础内容',
        icon:'global',
        path:'/base',
        type:'view',
        parent_code:'',
    },
    {
        code:'2',
        name:'站点信息',
        icon:'',
        path:'/base/site',
        type:'view',
        parent_code:'1',
    },
    {
        code:'3',
        name:'修改',
        icon:'',
        path:'/site/update',
        type:'update',
        parent_code:'2',
    },
    {
        code:'4',
        name:'公司信息',
        icon:'',
        path:'/base/company',
        type:'view',
        parent_code:'1',
    },
    {
        code:'5',
        name:'修改',
        icon:'',
        path:'/company/update',
        type:'update',
        parent_code:'4',
    },
    /**内容管理 */
    {
        code:'6',
        name:'内容管理',
        icon:'appstore-o',
        path:'/content',
        type:'view',
        parent_code:'',
    },
    {
        code:'7',
        name:'文章分类',
        icon:'',
        path:'/content/articleSort',
        type:'view',
        parent_code:'6',
    },
    {
        code:'8',
        name:'添加',
        icon:'',
        path:'/sort/create',
        type:'add',
        parent_code:'7',
    },
    {
        code:'9',
        name:'状态',
        icon:'',
        path:'/sort/modifyState',
        type:'status',
        parent_code:'7',
    },
    {
        code:'10',
        name:'排序',
        icon:'',
        path:'/sort/setSorting',
        type:'sort',
        parent_code:'7',
    },
    {
        code:'11',
        name:'修改',
        icon:'',
        path:'/sort/update',
        type:'update',
        parent_code:'7',
    },
    // -------------------------文章管理
    {
        code:'11',
        name:'文章管理',
        icon:'',
        path:'/content/article',
        type:'view',
        parent_code:'6',
    },
    {
        code:'12',
        name:'添加',
        icon:'',
        path:'/content/create',
        type:'add',
        parent_code:'11',
    },
    {
        code:'13',
        name:'状态',
        icon:'',
        path:'/content/modifyState',
        type:'status',
        parent_code:'11',
    },
    {
        code:'14',
        name:'置顶',
        icon:'',
        path:'/content/isTopStatus',
        type:'isTop',
        parent_code:'11',
    },
    {
        code:'15',
        name:'修改',
        icon:'',
        path:'/content/update',
        type:'update',
        parent_code:'11',
    },
    //------------------------轮播图管理
    {
        code:'16',
        name:'轮播图片',
        icon:'',
        path:'/content/banner',
        type:'view',
        parent_code:'6',
    },
    {
        code:'17',
        name:'添加',
        icon:'',
        path:'/banner/create',
        type:'add',
        parent_code:'16',
    },
    {
        code:'18',
        name:'状态',
        icon:'',
        path:'/banner/modifyState',
        type:'status',
        parent_code:'16',
    },
    {
        code:'19',
        name:'排序',
        icon:'',
        path:'/banner/setSorting',
        type:'isTop',
        parent_code:'16',
    },
    {
        code:'20',
        name:'修改',
        icon:'',
        path:'/banner/update',
        type:'update',
        parent_code:'16',
    },
    /**扩展内容 */
    {
        code:'21',
        name:'扩展内容',
        icon:'paper-clip',
        path:'/extend',
        type:'view',
        parent_code:'',
    },
    //------------------------友情链接
    {
        code:'22',
        name:'友情链接',
        icon:'',
        path:'/extend/friendLink',
        type:'view',
        parent_code:'21',
    },
    {
        code:'23',
        name:'添加',
        icon:'',
        path:'/link/create',
        type:'add',
        parent_code:'22',
    },
    {
        code:'24',
        name:'状态',
        icon:'',
        path:'/link/modifyState',
        type:'status',
        parent_code:'22',
    },
    {
        code:'25',
        name:'排序',
        icon:'',
        path:'/link/setSorting',
        type:'isTop',
        parent_code:'22',
    },
    {
        code:'26',
        name:'修改',
        icon:'',
        path:'/link/update',
        type:'update',
        parent_code:'22',
    },
    /** 组织管理 */
    {
        code:'27',
        name:'组织管理',
        icon:'usergroup-add',
        path:'/organization',
        type:'view',
        parent_code:'',
    },
    //------------------------部门管理
    {
        code:'28',
        name:'部门管理',
        icon:'',
        path:'/organization/department',
        type:'view',
        parent_code:'27',
    },
    {
        code:'29',
        name:'添加',
        icon:'',
        path:'/organization/department/create',
        type:'add',
        parent_code:'28',
    },
    {
        code:'30',
        name:'状态',
        icon:'',
        path:'/organization/department/modifyState',
        type:'status',
        parent_code:'28',
    },
    {
        code:'31',
        name:'排序',
        icon:'',
        path:'/organization/department/setSorting',
        type:'isTop',
        parent_code:'28',
    },
    {
        code:'32',
        name:'修改',
        icon:'',
        path:'/organization/department/update',
        type:'update',
        parent_code:'28',
    },
    //------------------------用户管理
    {
        code:'33',
        name:'用户管理',
        icon:'',
        path:'/organization/user',
        type:'view',
        parent_code:'27',
    },
    {
        code:'34',
        name:'添加',
        icon:'',
        path:'/organization/user/create',
        type:'add',
        parent_code:'33',
    },
    {
        code:'35',
        name:'状态',
        icon:'',
        path:'/organization/user/modifyState',
        type:'status',
        parent_code:'33',
    },
    {
        code:'36',
        name:'排序',
        icon:'',
        path:'/organization/user/setSorting',
        type:'isTop',
        parent_code:'33',
    },
    {
        code:'37',
        name:'修改',
        icon:'',
        path:'/organization/user/update',
        type:'update',
        parent_code:'33',
    },
    /** 消息管理 */
    {
        code:'38',
        name:'消息管理',
        icon:'notification',
        path:'/notify',
        type:'view',
        parent_code:'',
    },
    //------------------------系统公告
    {
        code:'39',
        name:'系统公告',
        icon:'',
        path:'/notify/systemBulletin',
        type:'view',
        parent_code:'38',
    },
    {
        code:'40',
        name:'添加',
        icon:'',
        path:'/message/create',
        type:'add',
        parent_code:'39',
    },
    {
        code:'41',
        name:'状态',
        icon:'',
        path:'/message/modifyState',
        type:'status',
        parent_code:'39',
    },
    {
        code:'42',
        name:'排序',
        icon:'',
        path:'/message/setSorting',
        type:'isTop',
        parent_code:'39',
    },
    {
        code:'43',
        name:'修改',
        icon:'',
        path:'/message/update',
        type:'update',
        parent_code:'39',
    },
    //------------------------网站留言
    {
        code:'44',
        name:'网站留言',
        icon:'',
        path:'/notify/websiteMessage',
        type:'view',
        parent_code:'38',
    },
    {
        code:'45',
        name:'添加',
        icon:'',
        path:'/message/create',
        type:'add',
        parent_code:'44',
    },
    {
        code:'46',
        name:'状态',
        icon:'',
        path:'/message/modifyState',
        type:'status',
        parent_code:'44',
    },
    {
        code:'47',
        name:'回复',
        icon:'',
        path:'/message/setSorting',
        type:'isTop',
        parent_code:'44',
    },
    {
        code:'48',
        name:'修改',
        icon:'',
        path:'/message/update',
        type:'update',
        parent_code:'44',
    },
    /** 系统管理 */
    {
        code:'49',
        name:'系统管理',
        icon:'setting',
        path:'/setting',
        type:'view',
        parent_code:'',
    },
    //------------------------个人中心
    {
        code:'50',
        name:'个人中心',
        icon:'',
        path:'/setting/personal',
        type:'view',
        parent_code:'49',
    },
    {
        code:'51',
        name:'修改',
        icon:'',
        path:'/message/update',
        type:'update',
        parent_code:'50',
    },
    //------------------------系统用户
    {
        code:'52',
        name:'系统用户',
        icon:'',
        path:'/setting/admin',
        type:'view',
        parent_code:'49',
    },
    {
        code:'53',
        name:'添加',
        icon:'',
        path:'/message/create',
        type:'add',
        parent_code:'52',
    },
    {
        code:'54',
        name:'状态',
        icon:'',
        path:'/message/modifyState',
        type:'status',
        parent_code:'52',
    },
    {
        code:'55',
        name:'重置密码',
        icon:'',
        path:'/message/setSorting',
        type:'isTop',
        parent_code:'52',
    },
    {
        code:'56',
        name:'修改',
        icon:'',
        path:'/message/update',
        type:'update',
        parent_code:'52',
    },
    //------------------------角色配置
    {
        code:'56',
        name:'角色配置',
        icon:'',
        path:'/setting/post',
        type:'view',
        parent_code:'49',
    },
    {
        code:'57',
        name:'添加',
        icon:'',
        path:'/message/create',
        type:'add',
        parent_code:'56',
    },
    {
        code:'58',
        name:'状态',
        icon:'',
        path:'/message/modifyState',
        type:'status',
        parent_code:'56',
    },
    {
        code:'59',
        name:'重置密码',
        icon:'',
        path:'/message/setSorting',
        type:'isTop',
        parent_code:'56',
    },
    {
        code:'60',
        name:'修改',
        icon:'',
        path:'/message/update',
        type:'update',
        parent_code:'56',
    },
]

class Boot {
    /**
     * 创建系统超级管理员、角色、权限
     */
    async init(){
        //查询用户名为admin的用户是否存在
        const existAdmin = await User.findOne({
            where: {
                username: adminConfig.username
            }
        });

        if (!existAdmin) {
            // 加密密码
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(adminConfig.password, salt);
            adminConfig.password = hash;

            const t = await db_common.transaction();
            try{
                // 创建用户
                const newUser = await User.create({
                    username: adminConfig.username,
                    password: adminConfig.password,
                    email: adminConfig.email,
                    roles_id: adminConfig.roles_id,
                    nickname: adminConfig.nickname,
                    head_img: adminConfig.head_img
                });

                //创建角色
                const newRole = await Role.create({
                    role_name: '系统管理员',
                    role_desc: '拥有系统所有权限',
                });

                const resourceArray =  await Resource.bulkCreate(resourceList);


                //用户关联角色
                await UserRole.destroy({
                    where:{
                        userId:newUser.id
                    }
                })
                await UserRole.create({
                    userId : newUser.id,
                    roleId : newRole.id
                });

                //插入权限
                let ResourceRoleList = [];
                resourceArray.map((item)=>{
                    ResourceRoleList.push({
                        roleId:newRole.id,
                        resourceId:item.id,
                    })
                })
                console.log(ResourceRoleList)
                await ResourceRole.bulkCreate(ResourceRoleList);

                await t.commit();
            }catch(e){
                await t.rollback();
                console.log(e)
            }
            
        }
    }
}

module.exports = new Boot();