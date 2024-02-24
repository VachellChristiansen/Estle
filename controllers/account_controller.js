import { HTTP_STATUS_CODE } from '../constants/global_constant.js'

class AccountController {
  GET() {
    return {
      base(req, res) {
        return res.status(HTTP_STATUS_CODE).send("Hello Mom!")
      }
    }
  }

  POST() {
    return {
      createAccount(req, res) {
        
      }
    }
  }
}

export default new AccountController()