import express from 'express'

import AccountController from '../../controllers/finance/account_controller'

const accountRouter = express.Router()

accountRouter.get('/', AccountController.GET().base)

export default accountRouter