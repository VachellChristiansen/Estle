import { HTTP_STATUS_CODE } from '../constants/global_constant.js'

import { Session } from '../models/session_model.js'

class Verificator {
  SESSION() {
    return {
      async verification(req, res, next) {
        const sid = req.cookies.SessionID
        if (!sid) {
          return res.status(HTTP_STATUS_CODE.client_error.unauthorized).send("Verification Error: User doesn't have Session ID")
        }
        const session = await Session.findOne({
          where: {
            SessionID: sid
          }
        })
        if (!session) {
          return res.status(HTTP_STATUS_CODE.client_error.unauthorized).send("Verification Error: Session ID doesn't exist")
        }
        req.user = session.get()
        next()
      }
    }
  }
}

export default new Verificator()