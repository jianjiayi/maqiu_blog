/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 13:58:49
 * @LastEditTime: 2019-04-15 13:55:01
 */


//user接口
const user = require('../api/user');
//分类接口
const contentSort = require('../api/content_sort');
//文章接口
const content = require('../api/content');
//文章评论接口
const comment = require('../api/comment');
//回复评论接口
const commentReply = require('../api/comment_reply');
//点赞接口
const praise = require('../api/praise');
//上传文件接口
const upload = require('../api/upload');
//发送邮件接口
const sendMail = require('../api/send_mail');

module.exports = [
  user,
  contentSort,
  content,
  comment,
  commentReply,
  praise,
  upload,
  sendMail
]
  
