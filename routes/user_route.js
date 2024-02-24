import express from 'express'

import UserController from '../controllers/user_controller.js'

import Validator from '../middlewares/validator.js'

const userRouter = express.Router()

userRouter.post('/create', Validator.USER().create, UserController.POST().createUser)
userRouter.post('/login', Validator.USER().login, UserController.POST().loginUser)

export default userRouter