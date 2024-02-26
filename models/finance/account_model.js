import { DataTypes } from 'sequelize'
import sequelize from '../db.js'

export const Account = sequelize.define('Account', {
  Balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  Type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  BankName: {
    type: DataTypes.STRING,
  },
  BankNumber: {
    type: DataTypes.BIGINT,
  },
  Provider: {
    type: DataTypes.STRING,
  },
  WalletNumber: {
    type: DataTypes.BIGINT
  }
})

