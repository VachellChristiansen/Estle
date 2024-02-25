import { HTTP_STATUS_CODE } from '../constants/global_constant.js'
import { User } from '../models/user_model.js'
import { Session } from '../models/session_model.js'

import bcrypt from 'bcrypt'
import crypto from 'crypto'

class UserController {
  /**
   * Handles `GET` request for User Routes
   */
  GET() {
    return {
      base(req, res) {
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Hello Mom!")
      }
    }
  }
  
  /**
   * Handles `POST` request for User Routes
   */
  POST() {
    const helper = new UserControllerHelper()
    return {
      /**
       * Controller to create `user` using `request body`
       * 
       * Does:
       * - Check for existing user and returns **HTTP Error** if found
       * - Create user in database
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
       * - Creates session in database
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
        const maxAge = 1000 * 60 * 60
        Session.create({
          SessionID: sessionId,
          ExpiredAt: new Date(Date.now() + maxAge),
          UserAgent: req.get('User-Agent'),
          IpAddress: req.ip,
          UserId: user.get().id
        })
        res.cookie('SessionID', sessionId, {
          maxAge: maxAge,
          httpOnly: true
        })
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Successful Login")
      }
    }
  }
  
  /**
   * Handles `PATCH` request for User Routes
   */
  PATCH() {
    const helper = new UserControllerHelper()
    return {
      /**
       * Controller to change user's name
       * 
       * Does:
       * - Check for existing user name and returns **HTTP Error** if already used
       * - Check for password and returns **HTTP Error** if incorrect
       * - Updates user's name in database
       * 
       * Returns **HTTP Success** when done
       */
      async changeName(req, res) {
        let body = req.body
        let userExists = await helper.isUserExists(body.name)
        if (userExists) {
          return res.status(HTTP_STATUS_CODE.client_error.conflict).send("Name is alredy used")
        }
        User.update({
          UserName: body.name
        }, {
          where: {
            id: req.user.id 
          }
        })
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Name Changed Successfully")
      }
    }
  }
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