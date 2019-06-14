/*
 * @Author: big bug
 * @Email: 13121378101@163.com
 * @Date: 2019-04-02 14:14:03
 * @LastEditTime: 2019-04-18 15:11:56
 */

const { sequelize } = require('./db_init');

class DbCommon{
    /**
     * 执行事务
     */
    async transaction(){
        return await sequelize.transaction();
    }
}

module.exports = new DbCommon();
