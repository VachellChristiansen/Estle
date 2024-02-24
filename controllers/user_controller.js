import { HTTP_STATUS_CODE } from '../constants/global_constant.js'
import { User } from '../models/user_model.js'
import { Session } from '../models/session_model.js'

import bcrypt from 'bcrypt'
import crypto from 'crypto'

class UserController {
  GET() {
    return {
      base(req, res) {
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Hello Mom!")
      }
    }
  }

  POST() {
    const helper = new UserControllerHelper()
    return {
      async createUser(req, res) {
        let body = req.body
        let userExists = await helper.isUserExists(body.name)
        if (userExists) {
          return res.status(HTTP_STATUS_CODE.client_error.conflict).send("User already exists")
        }
        User.create({
          UserName: body.name,
          UserPass: bcrypt.hashSync(body.pass, 12)
        })
        return res.status(HTTP_STATUS_CODE.successful.created).send("User Created!")
      },
      async loginUser(req, res) {
        let body = req.body
        let userExists = await helper.isUserExists(body.name)
        let passCorrect = await helper.isPassCorrect(body.name, body.pass)
        if (!userExists) {
          return res.status(HTTP_STATUS_CODE.client_error.unauthorized).send("User doesn't exist")
        }
        if (!passCorrect) {
          return res.status(HTTP_STATUS_CODE.client_error.unauthorized).send("Password is incorrect")
        }
        const user = await helper.getUserDataByName(body.name)
        const sessionId = crypto.randomBytes(16).toString('hex')
        Session.create({
          SessionID: sessionId,
          UserId: user.get().id
        })
        res.cookie('SessionID', sessionId, {
          maxAge: 1000 * 60 * 60,
          httpOnly: true
        })
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Successful Login")
      }
    }
  }

  // TODO: Create Patch method to update user's name
  // PATCH() {
  //   const helper = new UserControllerHelper()
  //   return {
  //     async changeUserName(req, res) {
  //       let body = req.body
  //       let userExists = await helper.isUserExists(body.name)
  //       if (userExists) {
  //         return res.status(HTTP_STATUS_CODE.client_error.conflict).send("User already exists")
  //       }
  //       User.update({
  //         UserName: body.name
  //       }, {
  //         where: {
  //           UserName: 
  //         }
  //       })
  //     }
  //   }
  // }
}

class UserControllerHelper {
  async getUserFromSession(sid) {
    const userId = await Session.findAll({
      attributes: ['UserId']
    }, {
      where: {
        SessionID: sid
      }
    })
    return userId
  }

  async getUserDataById(userId) {
    const user = await User.findOne({
      where: {
        id: userId
      }
    })
    return user
  }

  async getUserDataByName(name) {
    const user = await User.findOne({
      where: {
        UserName: name
      }
    })
    return user
  }

  async isUserExists(name) {
    const user = await User.findAll({
      // attributes: ['UserName'],
      where: {
        UserName: name
      }
    })
    return user.length > 0
  }

  async isPassCorrect(name, pass) {
    const user = await User.findAll({
      attributes: ['UserName', 'UserPass'],
      where: {
        UserName: name
      }
    })
    return bcrypt.compareSync(pass, user[0].get().UserPass)
  }
}

export default new UserController()