/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 14:50:05
 * @LastEditTime: 2019-04-11 13:07:11
 */


const statusCode = {
    ERROR_401:(msg) =>{
        return {
            code:401,
            msg
        }
    },
    ERROR_403:(msg) =>{
        return {
            code:403,
            msg
        }
    },
    ERROR_404:(msg) =>{
        return {
            code:404,
            msg
        }
    },
    ERROR_412:(msg,data) =>{
        return {
            code:412,
            msg,
            data
        }
    },
    SUCCESS_200:(msg,data) =>{
        return {
            code:200,
            msg,
            data
        }
    },
}
module.exports = statusCode;