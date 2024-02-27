import { HTTP_STATUS_CODE } from '../constants/global_constant.js'
import { User } from '../models/user_model.js'
import { Session } from '../models/session_model.js'
import { Account, AccountType } from '../models/finance/account_model.js'
import sequelize from '../models/db.js'

class Controller {
  GET() {
    return {
      base(req, res) {
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Hello Mom!")
      },
      async migrate(req, res) {
        User.hasMany(Account)
        User.hasOne(Session)
        Account.belongsTo(User)
        Session.belongsTo(User)
        Account.belongsToMany(AccountType, { through: 'AccountAccountType', foreignKey: 'AccountId' })
        AccountType.belongsToMany(Account, { through: 'AccountAccountType', foreignKey: 'AccountTypeId' })

        await sequelize.sync({ force: true });
        return res.status(HTTP_STATUS_CODE.successful.created).send("Migration Done!")
      }
    }
  }
}

export default new Controller()