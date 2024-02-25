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
      /**
       * Controller to create `user` using `request body`
       * 
       * Does:
       * - Check for existing user and returns **HTTP Error** if found
       * 
       * Returns **HTTP Success** when done
       */
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
      
      /**
       * Controller to login `user` using `request body`
       * 
       * Does:
       * - Check for existing user and returns **HTTP Error** if not found
       * - Check for password and returns **HTTP Error** if incorrect
       * 
       * Returns **HTTP Success** when done
       */
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
  /**
   * Get `User ID` based on `Session ID` in **Session** table
   * 
   * @param {*} sid 
   * @returns {number} userId
   */
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

  /**
   * Get `User Data` based on `User ID` in **User** table
   * 
   * @param {*} userId 
   * @returns user
   */
  async getUserDataById(userId) {
    const user = await User.findOne({
      where: {
        id: userId
      }
    })
    return user
  }

  /**
   * Get `User Data` based on `User ID` in **User** table
   * 
   * @param {*} userId 
   * @returns user
   */
  async getUserDataByName(name) {
    const user = await User.findOne({
      where: {
        UserName: name
      }
    })
    console.log(user)
    return user
  }

  /**
   * Check if user exists based on `name`
   * 
   * @param {*} userId 
   * @returns `true` if found
   */
  async isUserExists(name) {
    const user = await User.findAll({
      where: {
        UserName: name
      }
    })
    return user.length > 0
  }

  /**
   * Check if password is correct by comparison using [bcrypt](https://www.npmjs.com/package/bcrypt) library 
   * 
   * @param {*} userId 
   * @returns `true` if correct
   */
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