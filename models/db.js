import { Sequelize } from 'sequelize'
import 'dotenv/config'

let sequelize;
if (process.env.DATABASE == 'postgres') {
  sequelize = new Sequelize(process.env.POSTGRES_DATABASE, process.env.POSTGRES_USERNAME, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    logging: (msg) => {
      if (!msg.includes('Executing (default): SELECT 1+1 AS result')) {
        console.log(msg);
      }
    }
  })
} else if (process.env.DATABASE == 'mysql') {
  sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: (msg) => {
      if (!msg.includes('Executing (default): SELECT 1+1 AS result')) {
        console.log(msg);
      }
    }
  })
}

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

export default sequelize