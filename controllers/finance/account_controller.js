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
        const accountAndAccountTypeExists = await helper.isAccountAndAccountTypeExists(body.name, body.type, req.user.id)
        const accountTypeExists = await helper.isAccountTypeExists(body.type)
        if (accountAndAccountTypeExists) {
          return res.status(HTTP_STATUS_CODE.client_error.conflict).send("Account already exists")
        }
        if (!accountTypeExists) {
          return res.status(HTTP_STATUS_CODE.client_error.unprocessible_content).send("Account Type doesn't exists")
        }
        const accountTypeId = await helper.getAccountTypeId(req.user.id, body.type)
        await Account.create({
          AccountTypeId: accountTypeId.get().id,
          UserId: req.user.id,
          Name: body.name,
          Balance: body.balance,
          Provider: body.provider ? body.provider : " ",
          Number: body.number ? body.number : 0 
        })
        return res.status(HTTP_STATUS_CODE.successful.created).send("Account Added")
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
        const accountTypeExists = await helper.isAccountTypeExists(body.type)
        if (accountTypeExists) {
          return res.status(HTTP_STATUS_CODE.client_error.conflict).send("Type already exists")
        }
        await AccountType.create({
          Type: body.type,
          UserId: req.user.id
        })
        return res.status(HTTP_STATUS_CODE.successful.created).send("Account Type Added")
      }
    }
  }
}

class AccountControllerHelper {
  /**
   * Get `AccountType ID` based on `User ID` and `Type`
   * 
   * @param {*} userId 
   * @param {*} type
   * @returns accountType
   */
  async getAccountTypeId(userId, type) {
    const accountType = await AccountType.findOne({
      where: {
        Type: type,
        UserId: userId
      }
    })
    return accountType
  }

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
    return account != null
  }

  /**
   * Check if accountType exists based on `Type`
   * 
   * @param {*} type 
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
    return accountType != null
  }

  /**
   * Check if account and accountType exists based on `Account.Name` and `AccountType.Type`
   * 
   * @param {*} name 
   * @param {*} type 
   * @param {*} userId 
   * @returns `true` if found
   */
  async isAccountAndAccountTypeExists(name, type, userId) {
    if (!type || !name) {
      return null
    }
    const accountTypeId = await this.getAccountTypeId(userId, type)
    if (!accountTypeId) {
      return null
    }
    const account = await Account.findOne({
      where: {
        AccountTypeId: accountTypeId.get().id,
        Name: name
      }
    })
    return account != null
  }
}

export default new AccountController()