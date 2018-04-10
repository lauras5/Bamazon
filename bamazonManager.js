var inq = require('inquirer');
var mysql = require('mysql');
var itemInfo;

// Connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bamazon',
    port: 3306
});

connection.connect(function (e) {
    if (e) throw e;
});

// 'dropdown' menu for manager
var listMenu = [
    {
        type: 'checkbox',
        name: 'menu',
        message: 'What Would you like to Check?',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add new Product']
    },
];

// Adding stock to current products
var addMore = [
    {
        type: 'input',
        name: 'itemID',
        message: 'Which item number would you like to restock?'
    },
    {
        type: 'input',
        name: 'quantity',
        message: 'How much to you want to add?'
    },
];

// New item into MySQL
var newItems = [
    {
        type : 'input', 
        name : 'itemName',
        message : 'What is the item you would like to add?'
    },
    {
        type : 'input', 
        name : 'itemPrice',
        message : 'What price would you like to set for this item? (no symbols)'
    },
    {
        type : 'input', 
        name : 'itemQuantity',
        message : 'What is the quantity available for this item?'
    },
    {
        type : 'input', 
        name : 'itemDept', 
        message : 'What is the items department type? (ex : home decor, tech)'
    },
];

// var updateQty = `
// UPDATE products
// SET stock_quantity=?
// WHERE item_id=?`


inq.prompt(listMenu).then(function (ans) {
    console.log('>>>' + ans.menu[0])
    var chosenAns = ans.menu[0]

    if (chosenAns === 'View Products for Sale') {
        // id, name, price and qty
        connection.query('SELECT * FROM products', function (e, r) {
            if (e) throw e
            for (var i = 0; i < r.length; i++) {
                itemInfo = r[i]
                console.log(itemInfo.item_id + '. ' + itemInfo.product_name + '\nPrice : $' + itemInfo.price + '\nQuantity : ' + itemInfo.stock_quantity + '\n')
            }
            connection.end()
        })
    } else if (chosenAns === 'View Low Inventory') {
        connection.query('SELECT * FROM products WHERE stock_quantity < 5', function (e, r) {
            // If no items are returned
            if (r.length <= 0) {
                console.log('No items need restocking!')
                connection.end()
            // Otherwise run this to show low inventory items
            } else {
                for (var i = 0; i < r.length; i++) {
                    itemInfo = r[i]
                    console.log(itemInfo.item_id + '. ' + itemInfo.product_name + '\nPrice : $' + itemInfo.price + '\nQuantity : ' + itemInfo.stock_quantity + '\n')
                }
                connection.end()
            }
        })
    } else if (chosenAns === 'Add to Inventory') {
        connection.query('SELECT * FROM products', function (e, r) {
            if (e) throw e
            for (var i = 0; i < r.length; i++) {
                itemInfo = r[i]
                console.log(itemInfo.item_id + '. ' + itemInfo.product_name + '\nPrice : $' + itemInfo.price + '\nQuantity : ' + itemInfo.stock_quantity + '\n')
            }
            inq.prompt(addMore).then(function (ans) {
                console.log(ans)
                var itemToUpdate = ans.itemID
                // Need to turn into integer because it's a string
                var stockAdd = parseInt(ans.quantity)
                connection.query('SELECT * FROM products WHERE item_id=?;', [itemToUpdate], function(e, r) {
                    itemInfo = r[0]
                    console.log(itemInfo)
                    // Adds current amound and amount entered to get new quantity
                    var newQty = itemInfo.stock_quantity + stockAdd
                    // Updates in MySQL to new quantities
                    connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?', [newQty, itemToUpdate], function (e, r) {
                        console.log(r)
                        if (e) throw e
                        console.log('Item sucessfully Updated')
                        connection.end()
                    })
                })
            })
        })
    } else if (chosenAns === 'Add new Product') {
        inq.prompt(newItems).then(function(ans) {
            console.log(ans)
            var iName = ans.itemName
            var iPrice = parseInt(ans.itemPrice)
            var iQty = parseInt(ans.itemQuantity)
            var iDept = ans.itemDept
            connection.query('INSERT INTO products SET product_name = ?, department_name = ?, price = ?, stock_quantity = ?;', [iName, iDept, iPrice, iQty], function(e, r) {
                if (e) throw e
                console.log('You have successfully added a new item!')
            })
            connection.end()
        })
        // connection.end()
    } else {
        console.log('There has been an error, please try again')
        connection.end()
    }
})

