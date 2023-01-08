var express = require('express');
var router = express.Router();

const category_controller = require("../controllers/categoryController")
const item_controller = require("../controllers/itemController")

/* GET home page. */
router.get('/', category_controller.categories_show_get)

// Category

router.get('/category/:id', category_controller.category_show_get)

router.get('/category/:id/update', category_controller.category_update_get)

router.post('/category/:id/update', category_controller.category_update_post)

router.get('/category/:id/delete', category_controller.category_delete_get)

router.post('/category/:id/delete', category_controller.category_delete_post)

router.get("/create-category", category_controller.create_category_get)

router.post("/create-category", category_controller.create_category_post)


// Item

router.get("/create-item", item_controller.create_item_get)

router.post("/create-item", item_controller.create_item_post)

router.get("/items/:id", item_controller.item_detail_get)

router.get("/items/:id/update", item_controller.item_update_get)

router.post("/items/:id/update", item_controller.item_update_post)

router.get("/items/:id/delete", item_controller.item_delete_get)

router.post("/items/:id/delete", item_controller.item_delete_post)

module.exports = router;
