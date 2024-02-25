import { HTTP_STATUS_CODE } from '../constants/global_constant.js'

import Joi from 'joi'

class Validator {
  USER() {
    const userSchema = Joi.object({
      name: Joi.string()
        .alphanum()
        .min(3)
        .required(),
      pass: Joi.string()
        .alphanum()
        .min(8)
        .max(64),
      repeatPass: Joi.string()
        .alphanum()
        .min(8)
        .max(64)
    })
    return {
      /**
       * ### Middleware for validating user inputs at creating user
       * 
       * Uses userSchema to validate `user`, `pass`, and `repeatPass` from **request body**
       * 
       * Returns an **HTTP Error** if validation fails or `pass` is not same with `repeatPass`
       */
      create(req, res, next) {
        const { error } = userSchema.with('name', ['pass', 'repeatPass']).validate(req.body)
        if (error) {
          return res.status(HTTP_STATUS_CODE.client_error.bad_request).send(`Validation Error: ${error.message}`)
        }
        if (req.body.pass != req.body.repeatPass) {
          return res.status(HTTP_STATUS_CODE.client_error.bad_request).send(`Validation Error: ${error.message}`)
        }
        next()
      },

      /**
       * ### Middleware for validating user inputs at user login
       * 
       * Uses userSchema to validate `user` and `pass` from **request body**
       * 
       * Returns an **HTTP Error** if validation fails
       */
      login(req, res, next) {
        const { error } = userSchema.with('name', 'pass').validate(req.body)
        if (error) {
          return res.status(HTTP_STATUS_CODE.client_error.bad_request).send(`Validation Error: ${error.message}`)
        }
        next()
      },

      /**
       * ### Middleware for validating user inputs at user change name
       * 
       * Uses userSchema to validate `user` from **request body**
       * 
       * Returns an **HTTP Error** if validation fails
       */
      changeName(req, res, next) {
        const { error } = userSchema.without('name', ['pass', 'repeatPass']).validate(req.body)
        if (error) {
          return res.status(HTTP_STATUS_CODE.client_error.bad_request).send(`Validation Error: ${error.message}`)
        }
        next()
      }
    }
  }
}

export default new Validator()