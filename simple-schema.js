require('mysql2')
const { ORM, Model, PrimaryKeyType, StringType, StringNotNullType, DateType, NumberNotNullType } = require('taichi-orm')

/*
 * Runkit doesn't support Class Properties
 * So we assign properties in constructor
 */
class ShopModel extends Model{
  constructor(...args){
    super(...args)
    this.id = this.field(PrimaryKeyType)
    this.name = this.field(new StringType({length: 100}))
    this.products = ShopModel.hasMany(ProductModel, 'shopId')
  }
}

class ColorModel extends Model{
  constructor(...args){
    super(...args)
    this.id = this.field(PrimaryKeyType)
    this.code = this.field(new StringNotNullType({length: 50}))
  }
}

class ProductColorModel extends Model{
  constructor(...args){
    super(...args)
    this.id = this.field(PrimaryKeyType)
    this.productId = this.field(NumberNotNullType)
    this.colorId = this.field(NumberNotNullType)
    this.type = this.field(new StringNotNullType({length: 50}))
  }
}

class ProductModel extends Model{
  constructor(...args){
    super(...args)
    this.id = this.field(PrimaryKeyType)
    this.name = this.field(new StringType({length: 100}))
    this.createdAt = this.field(DateType)
    this.shopId = this.field(NumberNotNullType)
    this.shop = ProductModel.belongsTo(ShopModel, 'shopId')
    this.colors = ProductModel.hasManyThrough(ProductColorModel, ColorModel, 'id', 'colorId', 'productId')
    //computed property created based on colors
    this.colorsWithType = ProductModel.compute( (parent, type = 'main') => {
      return parent.$.colors({
        where: ({through}) => through.type.equals(type)
      })
    })
  }
}

module.exports = new ORM({
    models: {
        Shop: ShopModel, 
        Product: ProductModel, 
        Color: ColorModel, 
        ProductColor: ProductColorModel
    },
    knexConfig: {
        client: 'mysql2'
    }
})