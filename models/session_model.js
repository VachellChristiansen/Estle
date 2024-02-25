import { DataTypes } from 'sequelize'
import sequelize from './db.js'

export const Session = sequelize.define('Session', {
  SessionID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ExpiredAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  UserAgent: {
    type: DataTypes.STRING,
    allowNull: false
  },
  IpAddress: {
    type: DataTypes.INET,
    allowNull: false
  }
})