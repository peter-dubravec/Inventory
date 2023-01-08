const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, maxLength: 100 },
    price: { type: Number, min: 0 },
    number_in_stock: { type: Number, min: -1 },
    img: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    password: { type: String }
})

ItemSchema.virtual("url").get(function () {
    return `/items/${this._id}`
})

ItemSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

ItemSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model("Item", ItemSchema);