/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-15 13:46:42
 * @LastEditTime: 2019-04-15 16:34:40
 */

'use strict';

const nodemailer = require('nodemailer');

//邮箱配置
const { emailConfig } = require('../../config/index');

let transporter = nodemailer.createTransport({
    host: emailConfig.host,
    secureConnection: emailConfig.secureConnection, // 使用了 SSL
    secure: emailConfig.secure, // true for 465, false for other ports
    auth: emailConfig.auth
});

const sendMail = (mailOptions)=>{
    // send mail with defined transport object
    return transporter.sendMail({
        from: emailConfig.from, // sender address
        to: mailOptions.to, // list of receivers
        subject: mailOptions.subject, // Subject line
        text: mailOptions.text, // plain text body
        html: mailOptions.html // html body
    }, (error, info) => {
        if (error) {
            
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
    });
}

module.exports = sendMail;