import { HTTP_STATUS_CODE } from '../constants/global_constant.js'

import { Session } from '../models/session_model.js'

class Verificator {
  SESSION() {
    return {
      verification(req, res, next) {
        
      }
    }
  }
}

export default new Verificator()