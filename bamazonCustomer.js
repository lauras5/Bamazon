var inq = require('inquirer');
var mysql = require('mysql');
var ListView = ''
var userItemNum;
var userItemAmt;

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

var q_1 = [
  {
    type: 'input',
    name: 'itemID',
    message: 'What is the number of the item you would like to purchase?'
  },
];

var q_2 = [
  {
    type: 'input',
    name: 'amount',
    message: 'How many would you like to purchase?'
  },
];

var getAns = `
SELECT * FROM products
WHERE item_id=?`

var updateAmt = `
UPDATE products
SET stock_quantity=?
WHERE item_id=?`

connection.query('SELECT * FROM products', function (e, r) {
  if (e) throw e;
  for (var i = 0; i < r.length; i++) {
    var itemInfo = r[i]
    console.log(itemInfo.item_id + '. ' + itemInfo.product_name + '\nDepartment : ' + itemInfo.department_name + '\nPrice : $' + itemInfo.price + '\n')
  }
  inq.prompt(q_1).then(function (ans) {
    connection.query(getAns, [ans.itemID], function (e, r) {
      // console.log(r)
      var itemNum = r[0].item_id
      var cItem = r[0].product_name
      var cItemPrice = r[0].price
      var cItemQty = r[0].stock_quantity
      if (e) throw e
      console.log('Your Selection : ' + cItem + ', $' + cItemPrice)
      inq.prompt(q_2).then(function (amt) {
        // console.log(amt.amount)
        // console.log(cItemQty)
        if (amt.amount <= cItemQty) {
          var newQty = cItemQty - amt.amount
          connection.query(updateAmt, [newQty, itemNum], function (e, r) {
            console.log('You have purchased ' + amt.amount + ' ' + cItem + '. Thank you for your business!')
            connection.end(function(e) {
              if (e) throw e
            })
          })
        } else {
          console.log("We don't have enough stock, please come back another time!")
          connection.end()
        }
      })
    })
  })
});


