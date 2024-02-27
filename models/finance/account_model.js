import { DataTypes } from 'sequelize'
import sequelize from '../db.js'

export const Account = sequelize.define('Account', {
  Balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Provider: {
    type: DataTypes.STRING,
  },
  Number: {
    type: DataTypes.BIGINT
  }
})

export const AccountType = sequelize.define('AccountType', {
  Type: {
    type: DataTypes.STRING,
    allowNull: false
  }
})