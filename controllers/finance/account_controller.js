import { HTTP_STATUS_CODE } from '../../constants/global_constant.js'
import { Account, AccountType } from '../../models/finance/account_model.js'

class AccountController {
  GET() {
    const helper = new AccountControllerHelper()
    return {
      base(req, res) {
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Hello Mom!")
      }
    }
  }

  POST() {
    const helper = new AccountControllerHelper()
    return {
      /**
       * Controller to create `account` for logged in `user`
       * 
       * Does:
       * - Check for existing account in a type **HTTP Error** if not found
       * - Check for password and returns **HTTP Error** if incorrect
       * - Creates account in database
       * 
       * Returns **HTTP Success** when done
       */
      async createAccount(req, res) {
        const body = req.body
        console.log(body)
      },

      /**
       * Controller to create `accountType` for logged in `user`
       * 
       * Does:
       * - Check for existing accountType **HTTP Error** if not found
       * - Check for password and returns **HTTP Error** if incorrect
       * - Creates account in database
       * 
       * Returns **HTTP Success** when done
       */
      async createAccountType(req, res) {
        const body = req.body
        console.log('running controller')
        const accountTypeExists = await helper.isAccountTypeExists(body.type)
        if (accountTypeExists) {
          return res.status(HTTP_STATUS_CODE.client_error.conflict).send("Type already exists")
        }
        console.log('running controller 2')
        await AccountType.create({
          Type: body.type
        })
        return res.status(HTTP_STATUS_CODE.successful.created).send("Account Type Added")
      }
    }
  }
}

class AccountControllerHelper {
  /**
   * Check if account exists based on `name`
   * 
   * @param {*} name
   * @returns `true` if found
   */
  async isAccountExists(name) {
    if (!name) {
      return null
    }
    const account = await Account.findOne({
      where: {
        Name: name
      }
    })
    return account
  }

  /**
   * Check if accountType exists
   * 
   * @param {*} userId 
   * @returns `true` if found
   */
  async isAccountTypeExists(type) {
    if (!type) {
      return null
    }
    const accountType = await AccountType.findOne({
      where: {
        Type: type
      }
    })
    return accountType
  }
}

export default new AccountController()