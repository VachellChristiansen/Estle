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
        User.hasMany(AccountType)
        Account.belongsTo(User)
        AccountType.belongsTo(User)
        Session.belongsTo(User)

        AccountType.hasMany(Account)
        Account.belongsTo(AccountType)

        await sequelize.sync({ force: true });
        return res.status(HTTP_STATUS_CODE.successful.created).send("Migration Done!")
      },
      async test(req, res) {
        res.cookie('cookieName', 'cookieValue', { maxAge: 3000*60*60, sameSite: 'none', httpOnly: false });
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Request Done, Cookie Set")
      }
    }
  }
}

export default new Controller()