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
    const helper = new UserControllerHelper()
    return {
      base(req, res) {
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Hello Mom!")
      },

      /**
       * Controller to logout `user`
       * 
       * Does:
       * - Delete user's `session` from database
       * - Set Session ID cookie to expires
       * 
       * Returns **HTTP Success** when done
       */
      async logoutUser(req, res) {
        await Session.destroy({
          where: {
            UserId: req.user.id
          }
        })
        res.setHeader('Set-Cookie', `SessionID=${req.user.SessionID}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        return res.status(HTTP_STATUS_CODE.successful.ok).send("Successful Logout")
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
        await User.create({
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
        if (req.cookies.SessionID) {
          if (helper.isSessionExists(req.cookies.SessionID)) {
            return res.status(HTTP_STATUS_CODE.successful.ok).send("Successful Login")
          }
        }

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
        await Session.create({
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
      },
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
        await User.update({
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
  
  /**
   * Handles `DELETE` request for User Routes
   */
  DELETE() {
    const helper = new UserControllerHelper()
    return {
      /**
       * Controller to delete `user`
       * 
       * Does:
       * - Delete user's `session` from database
       * - Set Session ID cookie to expires
       * - Delete user's information from database
       * 
       * Returns **HTTP Success** when done
       */
      async deleteUser(req, res) {
        await Session.destroy({
          where: {
            UserId: req.user.id
          }
        })
        res.setHeader('Set-Cookie', `SessionID=${req.user.SessionID}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
        await User.destroy({
          where: {
            id: req.user.UserId
          }
        })
        res.status(HTTP_STATUS_CODE.successful.no_content).send("User Deleted")
      }
    }
  }
}

class UserControllerHelper {
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
   * Get `User Data` based on `Name` in **User** table
   * 
   * @param {*} name 
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
    const user = await User.findOne({
      where: {
        UserName: name
      }
    })
    return user != null
  }

  /**
   * Check if session exists based on `sid`
   * 
   * @param {*} sid 
   * @returns `true` if found
   */
  async isSessionExists(sid) {
    const session = await Session.findOne({
      where: {
        SessionID: sid
      }
    })
    return session != null
  }

  /**
   * Check if password is correct by comparison using [bcrypt](https://www.npmjs.com/package/bcrypt) library 
   * 
   * @param {*} userId 
   * @returns `true` if correct
   */
  async isPassCorrect(name, pass) {
    const user = await User.findOne({
      attributes: ['UserName', 'UserPass'],
      where: {
        UserName: name
      }
    })
    if (!user) {
      return null
    }
    return bcrypt.compareSync(pass, user.get().UserPass)
  }
}

export default new UserController()