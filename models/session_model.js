import { DataTypes } from 'sequelize'
import sequelize from './db.js'

export const Session = sequelize.define('Session', {
  SessionID: {
    type: DataTypes.STRING,
    allowNull: false
  }
})