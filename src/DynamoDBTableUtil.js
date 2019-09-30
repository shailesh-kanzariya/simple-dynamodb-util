const winston = require('winston')
winston.add(new winston.transports.Console()) // add console as trsport target
const debug = require('debug')('DynamoDBTableUtil')
const { SimpleDynamoDBUtil } = require('./SimpleDynamoDBUtil')
const { ValidationUtil } = require('./common-utils/ValidationUtil')

/**
 * creates a new object of DynamoDBTableUtil, exposes 'AWS DynamoDB Table' helper functions
 * @class DynamoDBTableUtil
 */
class DynamoDBTableUtil extends SimpleDynamoDBUtil {
  /**
   * @param {*} tableName name of the table for which to create the object
   * @param {*} [options=null] dynamodb config options
   */
  constructor (tableName, options = null) {
    const funcName = 'constructor:'
    if (options) {
      super(options)
    } else {
      super()
    }
    if (!tableName || typeof tableName !== 'string' || String(tableName).length <= 0) {
      winston.error(`${funcName}invalid tableName: = ${tableName}`)
      throw (new Error(`${funcName}invalid tableName: = ${tableName}`))
    }
    this.tableName = tableName
  } // constructor

  /**
   * initializes the DynamoDBTableUtil object by setting hash and range key attribute names
   */
  async init () {
    const funcName = 'init: '
    try {
      debug(`${funcName}this.tableName = ${this.tableName}`)
      await ValidationUtil.isValidString([this.tableName])
      // get hash and range key attributes name and set to this
      const hashKeyAttributeName = await super.getHashKeyAttributeNameForTable(this.tableName)
      debug(`${funcName}hashKeyAttributeName = ${hashKeyAttributeName}`)
      const rangeKeyAttributeName = await super.getRangeKeyAttributeNameForTable(this.tableName)
      debug(`${funcName}rangeKeyAttributeName = ${rangeKeyAttributeName}`)
      // validate both key values are valid
      await ValidationUtil.isValidString([hashKeyAttributeName])
      // now, set to this
      this.hashKeyAttributeName = hashKeyAttributeName
      if (rangeKeyAttributeName) {
        this.rangeKeyAttributeName = rangeKeyAttributeName
      }
      return this
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }

  /**
   * creates new item in table, if similar item already exist then this does not overwrite instead it throws an error
   * @param {JSON} itemJson item to create
   */
  async createNewItem (itemJson) {
    const funcName = 'createNewItem: '
    try {
      // validate input params
      await ValidationUtil.isValidObject([itemJson])
      debug(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      const data = await super.createNewItemInTable(this.tableName, itemJson, false) // don;t overwrite
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem

  /**
   * creates new item if similar item already does not exist in table, instead it overwrites and replaces existing item with new item
   * @param {*} itemJson item to create
   */
  async createNewOrReplaceItem (itemJson) {
    const funcName = 'createNewOrReplaceItem: '
    try {
      // validate input params
      await ValidationUtil.isValidObject([itemJson])
      debug(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      const data = await super.createNewItemInTable(this.tableName, itemJson) // overwrite existing similar item if exist
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem
} // class
module.exports = {
  DynamoDBTableUtil
}
