const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;



const CategorySchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, maxLength: 100 },
    password: { type: String }
})

CategorySchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

CategorySchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

CategorySchema.virtual("url").get(function () {
    return `/category/${this._id}`
})

module.exports = mongoose.model("Category", CategorySchema)