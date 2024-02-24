import { DataTypes } from 'sequelize'
import sequelize from './db.js'

export const User = sequelize.define('User', {
  UserName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  UserPass: {
    type: DataTypes.STRING,
    allowNull: false
  }
})