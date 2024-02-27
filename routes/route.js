import express from 'express'

import controller from '../controllers/controller.js'

import financeRouter from './finance/finance_route.js'
import userRouter from './user_route.js'
import Verificator from '../middlewares/verificator.js'

const router = express.Router()

router.use('/finance', Verificator.SESSION().verification)
router.use('/finance', financeRouter)

router.use('/user', userRouter)

router.get('/', controller.GET().base)
router.get('/migrate', controller.GET().migrate)
router.get('/test', controller.GET().test)

export default router