import pathToRegexp from 'path-to-regexp';

export default async(ctx,next)=>{
    const url = ctx.path;//请求地址

    const token = ctx.header['token'] || ctx.query['token'] || ctx.request.body['token']; //请求头中的token 或 请求参数里token(文件下载用)

}