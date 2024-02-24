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
      create(req, res, next) {
        const { error } = userSchema.with('name', ['pass', 'repeatPass']).validate(req.body)
        if (error) {
          return res.status(HTTP_STATUS_CODE.client_error.bad_request).send(error.message)
        }
        next()
      },
      login(req, res, next) {
        const { error } = userSchema.with('name', 'pass').validate(req.body)
        if (error) {
          return res.status(HTTP_STATUS_CODE.client_error.bad_request).send(error.message)
        }
        next()
      }
    }
  }
}

export default new Validator()