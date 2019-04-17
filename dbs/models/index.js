/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 14:24:01
 * @LastEditTime: 2019-04-12 16:05:33
 */


const db = require('../config');
const Sequelize = db.sequelize;

//导入模型
const User = Sequelize.import('./user.js');
const ContentSort = Sequelize.import('./content_sort.js');
const Content = Sequelize.import('./content.js');

const Comment = Sequelize.import('./comment');
const CommentReply = Sequelize.import('./comment_reply');
const Praise = Sequelize.import('./praise');


//用户与分类:1对多关系
ContentSort.belongsTo(User,{foreignKey:'createUserId',as:'createUserInfo'});
//分类与文章:1对多关联
Content.belongsTo(ContentSort,{foreignKey:'contentSortId',as:'contentSortInfo'});
//用户与文章:1对多关联
// Content.belongsTo(User,{foreignKey:'createUserId',as:'createUserInfo'});
Content.belongsTo(User,{foreignKey:'createUserId',as:'createUserInfo'});
//用户与评论:1对多关系
Comment.belongsTo(User,{foreignKey:'formUid',as:'formUser'});
//用户与回复:1对多关系
CommentReply.belongsTo(User,{foreignKey:'formUid',as:'formUser'});
CommentReply.belongsTo(User,{foreignKey:'toUid',as:'toUser'});

//评论与回复:1对多关系
Comment.hasMany(CommentReply, {foreignKey:'replyId', targetKey:'id', as:'replyList'});

//用户与点赞:1对多关系
Praise.belongsTo(User,{foreignKey:'userId',as:'praiseUserInfo'});
//评论与点赞:1对1关系
Comment.hasOne(Praise, {foreignKey:'typeId', targetKey:'id', as:'ownPraise'});
//回复评论与点赞:1对1关系
CommentReply.hasOne(Praise, {foreignKey:'typeId', targetKey:'id', as:'ownPraise'});

//将所有模型添加到数组
const models = {
    User,
    ContentSort,
    Content,
    Comment,
    CommentReply,
    Praise,
};
//创建数据表
for(let item in  models){
    models[item].sync({force:false}); 
}

module.exports = models;