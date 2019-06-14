/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-03 15:56:55
 * @LastEditTime: 2019-04-16 17:56:01
 */

const Router = require('koa-router');
const multer = require('koa-multer');
const path = require('path');
const fs = require('fs');
const qiniu = require('qiniu');
//配置文件
const { qiniuConfig } = require('../config/index');
//状态码
const code = require('./utils/statusCode');


const router = new Router({
    prefix:'/upload'
})

const storage = multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    //修改文件名称
    filename: function (req, file, cb) {
      var fileFormat = (file.originalname).split(".");
      cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
})
//加载配置
const upload = multer({storage});

//删除图片
const removeTemImage = (path) =>{
  return fs.unlink(path, (err) => {
    if (err) {
      throw err
    }
  })
}
//上传到七牛云
const upToQiniu = (filePath, key)=>{
  const accessKey = qiniuConfig.accessKey;// 你的七牛的accessKey
  const secretKey = qiniuConfig.secretKey;// 你的七牛的secretKey
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);


  const options = {
    scope: qiniuConfig.scope // 你的七牛存储对象
  }
  
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);

  const config = new qiniu.conf.Config();


  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z1;

  const localFile = filePath;
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();

  // 文件上传
  return new Promise((resolved, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      
      if (respErr) {
        reject(respErr)
      }
      if (respInfo.statusCode == 200) {
        resolved(respBody)
      } else {
        resolved(respBody)
      }
    })
  })

}

 /**
  * @name: 上传单个文件
  * @param {type} 
  * @returns: 
  */
router.post('/file',upload.single('file'),async(ctx,next)=>{
  //获取存储文件的路径
  const serverPath = path.join( './public/uploads/');
  //拼接全路径
  const imgPath = path.join(serverPath, ctx.req.file.filename);
  // 上传到七牛
  const qiniu = await upToQiniu(imgPath, ctx.req.file.filename);
  //删除本地图片
  removeTemImage(imgPath);
  
  ctx.response.status = 200;
  ctx.body = code.SUCCESS_200('上传成功',{
    imgUrl: 'http://xiaopiqiu.online/'+qiniu.key  //返回文件名 
  });

});
 
module.exports = router;