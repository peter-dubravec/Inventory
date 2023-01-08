#! /usr/bin/env node

console.log('This script populate database with dummy data');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const categories = []
const items = []


function categoryCreate(name, description, cb) {
    categorydetail = { name, description }

    var category = new Category(categorydetail);

    category.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Category: ' + category);
        categories.push(category)
        cb(null, category)
    });
}

function itemCreate(name, description, price, number_in_stock, category, cb) {
    const itemdetail = { name, description, price, number_in_stock, category }

    const item = new Item(itemdetail)

    item.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Genre: ' + item);
        items.push(item)
        cb(null, item);
    });
}


function createCategory(cb) {
    async.series([
        function (callback) {
            categoryCreate('Cars', 'Rent a nice car', callback);
        },
        function (callback) {
            categoryCreate('Tools', 'Rent proper tools', callback);
        },
        function (callback) {
            categoryCreate('Properties', 'Rent property', callback);
        },
        function (callback) {
            categoryCreate('Maschinery', 'Rent maschinery', callback);
        },
    ],
        // optional callback
        cb);
}


function createItem(cb) {
    async.parallel([
        // Cars
        function (callback) {
            itemCreate('Mercedes', 'New car', 5000, 1, categories[0], callback)
        },
        function (callback) {
            itemCreate('BMW', 'Older', 2000, 1, categories[0], callback)
        },
        // Tools
        function (callback) {
            itemCreate('Drill', 'Bosh drill', 20, 1, categories[1], callback)
        },
        function (callback) {
            itemCreate('Hammer', 'Pneumatic hammer', 25, 3, categories[1], callback)
        },

        // Properties
        function (callback) {
            itemCreate('Cottage', 'Wooden cottage', 200, 1, categories[2], callback)
        },
        function (callback) {
            itemCreate('Hotel', 'Hotel Room', 150, 5, categories[2], callback)
        },
        // Maschinery
        function (callback) {
            itemCreate('Truck', 'Rent a truck', 180, 1, categories[3], callback)
        },

        function (callback) {
            itemCreate('Tractor', 'Rent a tractor', 130, 1, categories[3], callback)
        },
    ],
        // Optional callback
        cb);
}



async.series([
    createCategory,
    createItem,
],
    // Optional callback
    function (err, results) {
        if (err) {
            console.log('FINAL ERR: ' + err);
        }
        else {
            console.log('Items: ' + items);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });
