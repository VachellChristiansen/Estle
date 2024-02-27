import express from 'express'

import controller from '../controllers/controller.js'

import accountRouter from './finance/account_route.js'
import userRouter from './user_route.js'
import Verificator from '../middlewares/verificator.js'

const router = express.Router()

router.use('/account', Verificator.SESSION().verification)
router.use('/account', accountRouter)

router.use('/user', userRouter)

router.get('/', controller.GET().base)
router.get('/migrate', controller.GET().migrate)

export default router