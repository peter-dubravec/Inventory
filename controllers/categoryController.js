const Category = require("../models/category")
const Item = require("../models/item")

const { body, validationResult } = require("express-validator");

const async = require("async")

// Show all categories
exports.categories_show_get = (req, res, next) => {
    Category.find({}, 'name').exec((err, results) => {
        if (err) {
            return next(err)
        }

        res.render("index", {
            title: "Homepage",
            results: results,
        })
    })
}

// Show all items in Category
exports.category_show_get = (req, res, next) => {
    async.parallel({
        items(callback) {
            Item.find({ category: req.params.id }).populate('category').exec(callback)
        },

        category(callback) {
            Category.findById(req.params.id).exec(callback)
        }
    }, (err, results) => {

        if (err) {
            return next(err)
        }

        res.render("category_items_show", {
            category: results.category,
            results: results.items,
            id: req.params.id,
        })
    })
}


exports.create_category_get = (req, res) => {
    res.render("category_form", {
        title: "Create Category",

    })
}

exports.create_category_post = [
    body("category_name", "Invalid category name").trim().isLength({ min: 1 }).escape(),
    body("category_description", "Invalid category description").trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.category_name,
            description: req.body.category_description,
        })

        category.password = category.generateHash(req.body.password)

        if (!errors.isEmpty()) {
            res.render("category_form", {
                title: "Create category",
                category,
                errors: errors.array()
            })
            return
        }

        category.save(err => {
            if (err) {
                return next(err)
            }

            res.redirect("/")
        })
    }
]

exports.category_update_get = (req, res, next) => {
    Category.findById(req.params.id).exec((err, category) => {
        if (err) {
            return next(err)
        }

        res.render("category_form", {
            title: "Update category",
            category,
        })

    })
}

exports.category_update_post = [
    body("category_name", "Invalid name").trim().isLength({ min: 1 }).escape(),
    body("category_description", "Invalid description").trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {

        Category.findById(req.params.id, 'password', (err, oldcategory) => {
            if (err) {
                return next(err)
            }

            const errors = validationResult(req)
            const category = new Category({
                _id: req.params.id,
                name: req.body.category_name,
                description: req.body.category_description,
                password: oldcategory.password
            })

            if (!errors.isEmpty()) {
                res.render("category_form", {
                    title: "Update category",
                    category,
                    errors: errors.array()
                })
                return
            }

            if (!category.validPassword(req.body.password)) {
                res.render("category_form", {
                    title: "Update category",
                    category,
                    errors: [{ msg: "Invalid password" }]
                })
                return
            }

            Category.updateOne({ _id: req.params.id }, category, {}, (err) => {
                if (err) {
                    return next(err)
                }

                res.redirect(`/category/${req.params.id}`)
            })

        })

    }
]

exports.category_delete_get = (req, res, next) => {
    Category.findById(req.params.id).exec((err, category) => {
        if (err) {
            return next(err)
        }

        res.render("category_delete", {
            title: "Delete category",
            category,
        })
    })
}

exports.category_delete_post = (req, res, next) => {
    Category.findById(req.params.id).exec((err, category) => {
        if (err) {
            return next(err)
        }

        if (!category.validPassword(req.body.password)) {
            res.render("category_delete", {
                title: "Delete category",
                category,
                error: "Invalid password"
            })
        } else {
            Category.findByIdAndDelete(req.params.id, (err) => {
                if (err) {
                    return next(err)
                }

                res.redirect("/")
            })
        }
    })

}