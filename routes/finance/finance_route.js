import express from 'express'

import accountRouter from './account_route.js'

const router = express.Router()

router.use('/account', accountRouter)

export default router