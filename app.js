import express from 'express'
import cors from 'cors'
import sanitizer from 'perfect-express-sanitizer'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import router from './routes/route.js'

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(
  sanitizer.clean({
    xss: true,
    noSql: true,
    sql: true,
    level: 5
  })
);

app.use('/', router)

const port = process.env.PORT || 8880

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})