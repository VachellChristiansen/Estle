import express from 'express'

import AccountController from '../../controllers/finance/account_controller.js'

import Validator from '../../middlewares/validator.js'

const accountRouter = express.Router()

accountRouter.get('/', AccountController.GET().base)

accountRouter.post('/createAccountType', Validator.ACCOUNT().type, AccountController.POST().createAccountType)

export default accountRouter