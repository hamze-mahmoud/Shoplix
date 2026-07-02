const Cart = require('../../models/Cart')
const Product = require('../../models/Product')
const mongoose = require('mongoose')
const { salePrice } = require('../../utils/pricing')

exports.addToCart = async (req, res) => {

const {
productId,
variantId,
quantity = 1
} = req.body
console.log(variantId);
console.log("hello from add to cart")
if (!productId || !variantId) {
return res.status(400).json({
error: 'productId and variantId required'
})
}
console.log("hello from add to cart2")

try {

const product = await Product.findById(productId)
console.log("hello from add to cart3")

if (!product) {
return res.status(404).json({
error: 'Product not found'
})
}

const variant = product.variants.id(variantId)
console.log("hello from add to cart4",variant)

if (!variant) {
return res.status(404).json({
error: 'Variant not found'
})
}
console.log("hello from add to cart5")

if (variant.stock < quantity) {
return res.status(400).json({
error: 'Not enough stock'
})
}

let cart = await Cart.findOne({
user: req.user.id
})

if (!cart) {
cart = new Cart({
user: req.user.id,
items: []
})
}

const existingItem = cart.items.find(item =>

String(item.product) === productId &&
String(item.variantId) === variantId

)
console.log("hello from add to cart6")

if (existingItem) {

const newQuantity =
existingItem.quantity + quantity

if (newQuantity > variant.stock) {
return res.status(400).json({
  success: false,
  error: {
    code: "INSUFFICIENT_STOCK",
    message: "Not enough stock available for this product",
    available: product.stock,
    requested: quantity
  }
});
}
console.log("hello from add to cart7")

existingItem.quantity = newQuantity

} else {

cart.items.push({

product: productId,
variantId,
quantity,
// charge the discounted price when the product is on sale
price: salePrice(variant.price, product.discountPercent)

})

}

await cart.save()

res.json({
success: true,
cart
})

} catch (err) {

console.error(err)

res.status(500).json({
error: 'Failed to add to cart'
})

}

}