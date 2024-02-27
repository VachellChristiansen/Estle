import express from 'express'

import UserController from '../controllers/user_controller.js'

import Validator from '../middlewares/validator.js'
import Verificator from '../middlewares/verificator.js'

const userRouter = express.Router()

userRouter.get('/', UserController.GET().base)
userRouter.get('/logout', Verificator.SESSION().verification, UserController.GET().logoutUser)

userRouter.post('/create', Validator.USER().create, UserController.POST().createUser)
userRouter.post('/login', Validator.USER().login, UserController.POST().loginUser)

userRouter.patch('/changeName', Verificator.SESSION().verification, Validator.USER().changeName, UserController.PATCH().changeName)

userRouter.delete('/delete', Verificator.SESSION().verification, UserController.DELETE().deleteUser)

export default userRouter