/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 14:34:02
 * @LastEditTime: 2019-04-18 15:31:05
 */

const Router = require('koa-router');
//md5
const md5 = require('js-md5');
//签名工具
const jwt = require('jsonwebtoken');
//加密工具
const bcrypt = require('bcryptjs');

const util = require('util');
const verify = util.promisify(jwt.verify);
//获取ip
const requestIp = require('request-ip');
//秘钥
const { secret } = require('../config/index');
//校验权限
const { getUserId, checkParams, checkPermise } = require('./utils/api_util');
//状态码
const code = require('./utils/statusCode');

//引入封装好的邮箱
const sendMail = require('./utils/mail');
//引入封装好的redis
const redisHelper = require('./utils/redis');

//sequelize事物
const db_common = require('../dbs/db_common');
//模型工具
const Op = require('../dbs/until');

//模型
const { User,Role,UserRole,Resource,ResourceRole } = require('../dbs/models/index');

const router = new Router({
    prefix: '/user'
});

/**
 * @name: 注册接口
 * @param { username , password , email, codeNum} 
 * @returns: {Promise<void>}
 */
router.post('/register', async (ctx, next) => {
    let {
        username,
        password,
        email,
        codeNum
    } = ctx.request.body;

    let params = {
        username,
        password,
        email,
        codeNum,
    }

    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    //角色：0=超级管理员，1=管理员，2=普通用户
    params.roles_id = 2;
    //检查用户是否被注册
    const existUserName = await User.findOne({
        where: {
            username: params.username
        }
    });
    if (existUserName) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('用户已存在，请重新注册');
        return;
    }
    //检查邮箱是否被占用
    const existEmail = await User.findOne({
        where: {
            email: params.email
        }
    });
    if (existEmail) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该邮箱已被占用,请使用其他邮箱');
        return;
    }

    //获取redis里的验证码   
    let redisCode = await redisHelper.getString(params.email).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    });
    console.log(redisCode);
    if (redisCode == null) {//验证码不存在或失效
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('验证码已失效，请重新申请');
        return;
    }

    if (redisCode != params.codeNum) {//输入验证码错误
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('验证码输入有误');
        return;
    };


    //注册用户
    try {
        // 加密密码
        const salt = bcrypt.genSaltSync();
        console.log('salt:' + salt);
        const hash = bcrypt.hashSync(params.password, salt);
        params.password = hash;

        // 创建用户
        await User.create({
            username: params.username,
            password: params.password,
            email: params.email,
            roles_id: params.roles_id,
            status: 1,
            nickname: '@' + params.username
        });
        const newUser = await User.findOne({
            where: {
                username: params.username,
            }
        });

        // 签发token
        const userToken = {
            username: newUser.username,
            email: newUser.email,
            id: newUser.id
        };

        // 储存token失效有效期1小时
        const token = jwt.sign(userToken, secret.sign, { expiresIn: '1h' });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('注册成功', {
            id: newUser.id,
            username: newUser.username,
            status: newUser.status,
            nickname: newUser.nickname,
            email: newUser.email,
            roles: newUser.roles_id,
            token: token
        });
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('注册失败', err);
    }
});



/**
 * @name: 用户登录接口
 * @param {username,password} 
 * @returns: 
 */
router.post('/login', async (ctx, next) => {
    const { username, password, remember } = ctx.request.body;

    let params = {
        username,
        password,
        remember
    }

    console.log(params.password)

    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    //查询用户是否存在
    const eUser = await User.findOne({
        where: {
            username: params.username
        }
    });
    if (eUser) {
        //判断密码是否和数据库一致
        if (bcrypt.compareSync(params.password, eUser.password)) {
            if (eUser.status == 0) {
                ctx.response.status = 412;
                ctx.body = code.ERROR_412('该用户未启用或已注销,请联系管理员');
                return;
            }
            // 获取用户ip
            let clientIp = requestIp.getClientIp(ctx.req);
            //更新登录信息
            await User.update({
                count: eUser.count + 1,
                last_login_ip: clientIp
            }, {
                    where: {
                        id: eUser.id
                    },
                });
            // 用户token
            const userToken = {
                username: eUser.username,
                id: eUser.id,
                roles: eUser.roles_id
            }
            //判断用户是否点击记住密码
            let effeciveTime = '24h';
            if (params.remember) {
                effeciveTime = '168h'//7天：24*7
            }

            // 签发token
            const token = jwt.sign(userToken, secret.sign, { expiresIn: effeciveTime });


            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('登录成功', {
                username: eUser.username,
                status: eUser.status,
                nickname: eUser.nickname,
                roles: eUser.roles_id,
                head_img: eUser.head_img,
                token: token
            });
        } else {
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('密码输入有误');
        }
    } else {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该用户不存在，请注册');
    }
});


/**
 * @name: 登录后修改密码
 * @param {oldpawd,newpawd} 
 * @returns: 
 */
router.post('/update_password', async (ctx, next) => {
    let {
        oldpawd,//旧密码
        newpawd//新密码
    } = ctx.request.body;

    let params = {
        oldpawd,
        newpawd
    }

    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    //查询用户是否存在
    const eUser = await User.findOne({
        where: {
            id: userId
        }
    });

    if (eUser) {
        //判断旧密码密码是否和数据库一致
        if (bcrypt.compareSync(oldpawd, eUser.password)) {
            if (eUser.status == 0) {
                ctx.response.status = 412;
                ctx.body = code.ERROR_412('该用户已被注销');
                return;
            }

            // 加密密码
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(params.newpawd, salt);
            params.newpawd = hash;

            //更新数据库用户密码
            try {
                await User.update({
                    password: params.newpawd
                }, {
                        where: {
                            id: userId
                        }
                    });

                ctx.response.status = 200;
                ctx.body = code.SUCCESS_200('修改密码成功')
            } catch (err) {
                ctx.response.status = 412;
                ctx.body = code.ERROR_412('修改密码失败');
            }
        } else {
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('旧密码输入有误');
        }
    } else {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该用户不存在，请注册');
    }
})


/**
 * @name: 修改头像接口
 * @param {imgsrc(base64)} 
 * @returns: 
 */
router.post('/update_headimg', async (ctx, next) => {
    const { imgsrc } = ctx.request.body;
    let params = {
        imgsrc,
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    try {
        await User.update({
            head_img: imgsrc
        }, {
                where: {
                    id: userId
                }
            });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('修改头像成功');
    } catch{
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('修改头像失败');
    }
})

/**
 * @name: 忘记密码-校验用户是否存在,并向该用户绑定的邮箱发送验证码邮件
 * @param {type} 
 * @returns: 
 */
router.post('/forget/getUser', async (ctx, next) => {
    const {
        username,
    } = ctx.request.body;

    let params = {
        username,
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    //查询用户是否存在
    const eUser = await User.findOne({
        where: {
            username: params.username
        }
    });
    if (!eUser) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该用户不存在，请重新输入');
        return;
    }
    //随机生成6位数字
    const createSixNum = () => {
        var Num = "";
        for (var i = 0; i < 6; i++) {
            Num += Math.floor(Math.random() * 10);
        }
        return Num;
    };
    let codeNum = createSixNum();
    //发送邮件内容
    let mailOptions = {
        to: eUser.email, // list of receivers
        subject: '验证码', // Subject line
        text: '验证码:' + codeNum, // plain text body
        html: '<p>您的验证码是:' + codeNum + ',请勿告诉他人,半小时内有效</p>' // html body
    };
    //发送邮箱
    await sendMail(mailOptions);

    //将邮箱验证码保存到redis中
    await redisHelper.setString(eUser.email, codeNum, 60 * 5).then((res) => {
        console.log('设置成功')
    }).catch((err => {
        console.log('设置失败', err)
    }));

    ctx.response.status = 200;
    ctx.body = code.SUCCESS_200('校验用户成功，已向用户绑定邮箱：' + eUser.email + '，发送验证码邮件')

})

/**
 * @name: 忘记密码-修改密码
 * @param {type} 
 * @returns: 
 */
router.post('/forget/updatePassword', async (ctx, next) => {
    const {
        username,
        codeNum,
        newpawd,
    } = ctx.request.body;

    let params = {
        username,
        codeNum,
        newpawd
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;


    //检查用户是否被注册
    const euser = await User.findOne({
        where: {
            username: params.username
        }
    });
    if (!euser) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该用户不存在，请重新输入');
    } else {
        //获取redis里的验证码   
        let redisCode = await redisHelper.getString(euser.email).then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        });
        console.log(redisCode);
        if (redisCode == null) {//验证码不存在或失效
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('验证码已失效，请重新申请');
            return;
        }

        if (redisCode != params.codeNum) {//输入验证码错误
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('验证码输入有误');
            return;
        };

        try {
            // 加密密码
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync(params.newpawd, salt);
            params.newpawd = hash;

            await User.update({
                password: params.newpawd
            }, {
                    where: {
                        username: params.username
                    }
                });

            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('修改密码成功');
        } catch (err) {
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('修改密码失败', err);
        }
    }

})

/**
 * @name: 修改个人资料
 * @param {type} 
 * @returns: 
 */
router.post('/update/info', async (ctx, next) => {
    const {
        head_img,
        nickname,
        email,
        codeNum,
    } = ctx.request.body;

    let params = {
        head_img,
        nickname,
        email,
        codeNum,
    }
    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    const user = await getUserId(ctx);
    const userId = user.id;

    //获取redis里的验证码   
    let redisCode = await redisHelper.getString(params.email).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    });
    console.log(redisCode);
    if (redisCode == null) {//验证码不存在或失效
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('验证码已失效，请重新申请');
        return;
    }

    if (redisCode != params.codeNum) {//输入验证码错误
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('验证码输入有误');
        return;
    };

    try {

        await User.update({
            head_img: params.head_img,
            nickname: params.nickname,
            email: params.email
        }, {
                where: {
                    id: userId
                }
            });

        const newUser = await User.findOne({
            where: {
                id: userId,
            }
        });

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('修改资料成功', {
            email: newUser.email,
            nickname: newUser.nickname,
            head_img: newUser.head_img,
        });
    } catch (err) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('修改资料失败', err);
    }

})


/**
 * @name: 获取用户角色
 * @param {type} 
 * @returns: 
 */
router.get('/getUserRoles', async (ctx, next) => {
    const user = await getUserId(ctx);
    const userId = user.id;
    //获取用户信息
    try {
        const data = await Role.findAll({
            where: {
                id: userId
            },
        });
        

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取用户角色成功', { data });

    } catch (err) {
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取用户角色失败');
    }
})

/**
 * @name: 查询用户权限
 * @param {type} 
 * @returns: 
 */
router.get('/getUserResources', async (ctx, next) => {
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
            attributes: ['code','parent_code','name','path','icon'],
            raw:true
        });
        
        //寻找子节点
        const findChild = (arr,List) => {//arr:顶级节点，List:所有子节点
            arr.map(e => {
                console.log(e)
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


        //获取用户所有的功能权限
        const apiList = await Resource.findAll({
            where:{
                id:{
                    [Op.in]: resourceArray
                },
                type:{
                    [Op.ne]:'view'
                },
            },
            raw:true
        });

        const data = {
            routes:listData,
            api:apiList
        }

        await t.commit();

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取用户权限成功', { data });

    } catch (err) {
        await t.rollback();
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取用户信息失败');
    }
})

/**
 * @name: 查询用户信息
 * @param {type} 
 * @returns: 
 */
router.get('/getUserInfo', async (ctx, next) => {
    const user = await getUserId(ctx);
    const userId = user.id;
    //获取用户信息
    try {
        const data = await User.findOne({
            where: {
                id: userId
            },
            include:[
                {//角色信息
                    model:Role,
                    as:'user_roles',
                    attributes:['role_name'],
                    required: true,
                },
            ],
            distinct:true
        });
        

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取用户信息成功', { data });

    } catch (err) {
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取用户信息失败');
    }
})

/**
 * @name: 管理员查询用户列表
 * @param {type} 
 * @returns: 
 */
router.post('/admin/getUserList', async (ctx, next) => {
    let {
        page = 1,
    } = ctx.request.body;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    //获取用户列表
    try {
        const data = await User.findAndCountAll({
            limit: 10,//每页10条
            offset: (page - 1) * 10,
            attributes: {
                exclude: ['password']
            },
            include:[
                {//角色信息
                    model:Role,
                    as:'user_roles',
                    attributes:['role_name'],
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


        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('获取列表成功', { list });

    } catch (err) {
        console.log(err);
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('获取列表失败');
    }
})


/**
 * @name: 管理员修改用户状态
 * @param {id} 0：注销，1正常
 * @returns: 
 */
router.post('/admin/updateUserStatus', async (ctx, next) => {
    const {
        id,
        status,//状态，1正常，0注销
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

    //修改用户状态
    try {
        await User.update({
            status: params.status
        }, {
                where: {
                    id: params.id
                }
            });
        if (params.status == 0) {
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('注销用户成功');
        } else {
            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('启动用户成功');
        }

    } catch (err) {
        console.log(err)
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('修改用户状态失败');
    }
})

/**
 * @name: 管理员添加用户
 * @param { username , password , email, codeNum} 
 * @returns: {Promise<void>}
 */
router.post('/admin/register', async (ctx, next) => {
    let {
        username,
        password,
        email,
        roleId,
    } = ctx.request.body;

    let params = {
        username,
        password,
        email,
        roleId
    }

    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    //检查用户是否被注册
    const existUserName = await User.findOne({
        where: {
            username: params.username
        }
    });
    if (existUserName) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('用户已存在，请重新注册');
        return;
    }
    //检查邮箱是否被占用
    const existEmail = await User.findOne({
        where: {
            email: params.email
        }
    });
    if (existEmail) {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该邮箱已被占用,请使用其他邮箱');
        return;
    }

    const t = await db_common.transaction();

    //注册用户
    try {
        // 加密密码
        const salt = bcrypt.genSaltSync();
        console.log('salt:' + salt);
        const hash = bcrypt.hashSync(params.password, salt);
        params.password = hash;

        // 创建用户
        await User.create({
            username: params.username,
            password: params.password,
            email: params.email,
            roles_id: 1,
            status: 1,
            nickname: '@' + params.username
        });
        const {id} = await User.findOne({
            where: {
                username: params.username,
            }
        });

        await UserRole.create({
            userId:id,
            roleId:params.roleId
        });

        await t.commit();

        ctx.response.status = 200;
        ctx.body = code.SUCCESS_200('注册成功',{});
    } catch (err) {
        await t.rollback();
        console.log(err)

        ctx.response.status = 412;
        ctx.body = code.ERROR_412('注册失败', err);
    }
});

/**
 * @name: 管理员帮助用户找回密码
 * @param {type} 
 * @returns: 
 */
router.post('/admin/helpUpdatePassword', async (ctx, next) => {
    let {
        username,//用户名称，具有唯一性
    } = ctx.request.body;

    let params = {
        username
    }

    // 检测参数是否存在为空
    if (!checkParams(ctx, params)) return;

    //校验是否有相关权限
    const is_admin = await checkPermise(ctx);
    if (!is_admin) return;

    //查询用户是否存在
    const eUser = await User.findOne({
        where: {
            username: params.username
        }
    });

    if (eUser) {

        //生成随机密码
        let randomPawd = Math.random().toString(36).substr(2);
        //先使用md5加密
        let newPassword = md5(randomPawd+params.username);

        // 加密密码
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(newPassword, salt);
        const password = hash;

        //更新数据库用户密码
        try {
            await User.update({
                password: password
            }, {
                    where: {
                        username: params.username
                    }
                });

            //发送邮件内容
            let mailOptions = {
                to: eUser.email, // list of receivers
                subject: '【麻球科技】温馨提示', // Subject line
                text: '您的新密码:' + randomPawd, // plain text body
                html: '<p>管理员已经帮您重置了密码，新的密码为:' + randomPawd + ',请注意保管，登陆后请到“个人中心->修改密码”页面修改密码</p>' // html body
            };
            //发送邮箱
            await sendMail(mailOptions);

            ctx.response.status = 200;
            ctx.body = code.SUCCESS_200('修改密码成功', {
                email: eUser.email
            })
        } catch (err) {
            ctx.response.status = 412;
            ctx.body = code.ERROR_412('修改密码失败');
        }
    } else {
        ctx.response.status = 412;
        ctx.body = code.ERROR_412('该用户不存在，请注册');
    }
})




module.exports = router;

