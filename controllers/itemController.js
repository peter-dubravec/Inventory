const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item")
const async = require("async");

const multer = require('multer')

//Configuration for Multer
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `images/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const upload = multer({
    storage: multerStorage,
});


exports.create_item_get = (req, res, next) => {
    Category.find({}).collation({ locale: "en" }).sort({ name: 1 }).exec((err, categories) => {

        if (err) {
            return next(err)
        }

        res.render("item_create", {
            title: "Create Item",
            categories
        })

    })
}

exports.create_item_post = [
    upload.single('image'),
    body("name", "Invalid item name").trim().isLength({ min: 1 }).escape(),
    body("description", "Invalid description").trim().isLength({ min: 1 }).escape(),
    body("price", "Invalid price").trim().isLength({ min: 1 }).escape(),
    body("stock", "Invalid number in stock").trim().isLength({ min: 1 }).escape(),
    body("category", "Invalid category").trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        console.log(req.file)
        const errors = validationResult(req)
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            number_in_stock: req.body.stock,
            category: req.body.category,
            img: (req.file === undefined ? "" : req.file.path),
        })

        item.password = item.generateHash(req.body.password)


        if (!errors.isEmpty()) {
            Category.find({}).collation({ locale: "en" }).sort({ name: 1 }).exec((err, categories) => {
                if (err) {
                    return next(err);
                }

                res.render("item_create", {
                    title: "Create Item",
                    categories,
                    item,
                    errors: errors.array(),
                })
            })
            return
        }

        item.save(err => {
            if (err) {
                return next(err)
            }

            res.redirect(`category/${req.body.category.toString()}`)
        })
    }
]

exports.item_detail_get = (req, res, next) => {
    Item.findById(req.params.id).exec((err, item) => {
        if (err) {
            return next(err)
        }

        res.render("item_detail", {
            title: item.name,
            item,

        })
    })
}


exports.item_delete_get = (req, res, next) => {
    Item.findById(req.params.id).exec((err, item) => {
        if (err) {
            return next(err)
        }

        res.render("item_delete", {
            title: "Delete item",
            item,
        })
    })
}

exports.item_delete_post = (req, res, next) => {
    Item.findById(req.params.id).exec((err, item) => {
        if (err) {
            return next(err)
        }

        if (!item.validPassword(req.body.password)) {
            res.render("item_delete", {
                title: "Delete item",
                item,
                error: "Wrong password"
            })
        } else {
            Item.findByIdAndRemove(req.params.id, {}, (err, item) => {
                if (err) {
                    return next(err)
                }

                res.redirect(`/category/${item.category}`)
            })
        }


    })
}



exports.item_update_get = (req, res, next) => {

    async.parallel({
        categories(callback) {
            Category.find({}).exec(callback)
        },

        item(callback) {
            Item.findById(req.params.id).exec(callback)
        }
    }, (err, results) => {
        if (err) {
            return next(err)
        }


        res.render("item_create", {
            title: "Create Item",
            categories: results.categories,
            item: results.item,
        })
    })
}

exports.item_update_post = [
    upload.none(),
    body("name", "Invalid item name").trim().isLength({ min: 1 }).escape(),
    body("description", "Invalid description").trim().isLength({ min: 1 }).escape(),
    body("price", "Invalid price").trim().isLength({ min: 1 }).escape(),
    body("stock", "Invalid number in stock").trim().isLength({ min: 1 }).escape(),
    body("category", "Invalid category").trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req)

        Item.findById(req.params.id).exec((err, itemBeforeUpdate) => {
            if (err) {
                return next(err)
            }

            const item = new Item({
                _id: req.params.id,
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                number_in_stock: req.body.stock,
                category: req.body.category,
                password: itemBeforeUpdate.password,
            })



            if (!errors.isEmpty() || !item.validPassword(req.body.password)) {
                let invalidPassword = false;
                if (!item.validPassword(req.body.password)) {
                    invalidPassword = "Invalid password"
                }

                Category.find({}).exec((err, categories) => {
                    if (err) {
                        return next(err);
                    }
                    res.render("item_create", {
                        title: "Update Item",
                        categories,
                        item,
                        errors: errors.array(),
                        invalidPassword,
                    })
                })
                return
            }

            Item.updateOne({ _id: req.params.id }, item, (err) => {
                if (err) {
                    return next(err)
                }

                res.redirect(item.url)
            })
        })

    }
]