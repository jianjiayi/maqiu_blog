/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 14:24:01
 * @LastEditTime: 2019-04-18 15:28:06
 */


const db = require('../db_init.js');
const Sequelize = db.sequelize;

/**导入模型 */

//用户表
const User = Sequelize.import('./cs_user.js');
//用户与角色关系表
const UserRole = Sequelize.import('./cs_user_role');
//角色表
const Role = Sequelize.import('./cs_role');
//权限表
const Resource = Sequelize.import('./cs_resource');
//角色与权限表
const ResourceRole = Sequelize.import('./cs_resource_role');

//分类表
const ContentSort = Sequelize.import('./cs_content_sort.js');
//文章表
const Content = Sequelize.import('./cs_content.js');
//评论表
const Comment = Sequelize.import('./cs_comment');
//回复表
const CommentReply = Sequelize.import('./cs_comment_reply');
//点赞表
const Praise = Sequelize.import('./cs_praise');
//友情链接表
const Link = Sequelize.import('./cs_link');
//幻灯片表
const Banner = Sequelize.import('./cs_banner');
//公司信息表
const Company = Sequelize.import('./cs_company');
//站点信息表
const Site = Sequelize.import('./cs_site');
//公告表
const Message = Sequelize.import('./cs_message');


/** 模型之间关系*/
//用户与角色：多对多关系
User.belongsToMany(Role, {
    through: {
        model: UserRole,
    },
    foreignKey: 'userId', //通过外键userId
    as: 'user_roles',
    constraints: false
});
Role.belongsToMany(User, {
    through: {
        model: UserRole,
    },
    foreignKey: 'roleId', //通过外键roleId
    as: 'role_users',
    constraints: false
});
// 角色对资源：多多关系
Role.belongsToMany(Resource, {
    through: {
        model: ResourceRole,
    },
    foreignKey: 'roleId', //通过外键roleId
    as: 'role_Resource',
    constraints: false
});
Resource.belongsToMany(Role, {
    through: {
        model: ResourceRole,
    },
    foreignKey: 'resourceId', //通过外键resourceId
    as: 'resource_roles',
    constraints: false
});

//用户与分类:1对多关系
ContentSort.belongsTo(
    User,
    {
        foreignKey: 'createUserId',
        as: 'createUserInfo'
    }
);
//分类与文章:1对多关联
Content.belongsTo(
    ContentSort,
    {
        foreignKey: 'contentSortId',
        as: 'contentSortInfo'
    }
);
//用户与文章:1对多关联
Content.belongsTo(
    User,
    {
        foreignKey: 'createUserId',
        as: 'createUserInfo'
    }
);
//用户与评论:1对多关系
Comment.belongsTo(
    User,
    {
        foreignKey: 'formUid',
        as: 'formUser'
    }
);
//用户与回复:1对多关系
CommentReply.belongsTo(
    User,
    {
        foreignKey: 'formUid',
        as: 'formUser'
    }
);
CommentReply.belongsTo(
    User,
    {
        foreignKey: 'toUid',
        as: 'toUser'
    }
);

//评论与回复:1对多关系
Comment.hasMany(
    CommentReply,
    {
        foreignKey: 'replyId',
        targetKey: 'id',
        as: 'replyList'
    }
);

//用户与点赞:1对多关系
Praise.belongsTo(
    User,
    {
        foreignKey: 'userId',
        as: 'praiseUserInfo'
    }
);
//评论与点赞:1对1关系
Comment.hasOne(
    Praise,
    {
        foreignKey: 'typeId',
        targetKey: 'id',
        as: 'ownPraise'
    }
);
//回复评论与点赞:1对1关系
CommentReply.hasOne(
    Praise,
    {
        foreignKey: 'typeId',
        targetKey: 'id',
        as: 'ownPraise'
    }
);

//用户与链接：1对多关系
Link.belongsTo(
    User,
    {
        foreignKey: 'createUserId',
        as: 'createUserInfo'
    }
);

//用户与banner：1对多关系
Banner.belongsTo(
    User,
    {
        foreignKey: 'createUserId',
        as: 'createUserInfo'
    }
);

//用户与公司信息：1对多关系
Company.belongsTo(
    User,
    {
        foreignKey: 'createUserId',
        as: 'createUserInfo'
    }
);

//用户与站点信息：1对多关系
Site.belongsTo(
    User,
    {
        foreignKey: 'createUserId',
        as: 'createUserInfo'
    }
);

//用户与公告：1对多关系
Message.belongsTo(
    User,
    {
        foreignKey: 'createUserId',
        as: 'createUserInfo'
    }
);




/**将所有模型添加到数组 */
const models = {
    User,
    ContentSort,
    Content,
    Comment,
    CommentReply,
    Praise,
    Link,
    Banner,
    Company,
    Site,
    Message,
    UserRole,
    Role,
    Resource,
    ResourceRole
};

/**创建数据表 */
for (let item in models) {
    models[item].sync({ force: false });
}

module.exports = models;