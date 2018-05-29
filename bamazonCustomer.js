// this js controls the customer experience
// require dependencies
var inq = require('inquirer');
var mysql = require('mysql');

var ListView = ''
var userItemNum;
var userItemAmt;

// Connection to MySQL DB 
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

// 1st question
var q_1 = [
  {
    type: 'input',
    name: 'itemID',
    message: 'What is the number of the item you would like to purchase?'
  },
];

// 2nd question
var q_2 = [
  {
    type: 'input',
    name: 'amount',
    message: 'How many would you like to purchase?'
  },
];

// throw queries into variables for cleaner code
var getAns = `
SELECT * FROM products
WHERE item_id=?`

var updateAmt = `
UPDATE products
SET stock_quantity=?
WHERE item_id=?`

// Connecting and retrieving all products from table
connection.query('SELECT * FROM products', function (e, r) {
  if (e) throw e;

  // Loops through products array, console logs id, name, dept and price
  for (var i = 0; i < r.length; i++) {
    var itemInfo = r[i]
    console.log(itemInfo.item_id + '. ' + itemInfo.product_name + '\nDepartment : ' + itemInfo.department_name + '\nPrice : $' + itemInfo.price + '\n')
  }

  // call question prompts
  inq.prompt(q_1).then(function (ans) {
    if (e) throw e

    // returns the info for the item they chose
    connection.query(getAns, [ans.itemID], function (e, r) {
      var itemNum = r[0].item_id
      var cItem = r[0].product_name
      var cItemPrice = r[0].price
      var cItemQty = r[0].stock_quantity

      // logs your selection to confirm choice
      console.log('Your Selection : ' + cItem + ', $' + cItemPrice)

      // second prompt 
      inq.prompt(q_2).then(function (amt) {
        if (e) throw e

        // if the quantity you want is available, then it lets you purchase
        if (amt.amount <= cItemQty) {
          var newQty = cItemQty - amt.amountcItemQty - amt.amount
          var total = amt.amount * cItemPrice

          connection.query(updateAmt, [newQty, itemNum], function (e, r) {
            if (e) throw e

            // logs the item you purchased, with the amount and total price
            console.log('You have purchased ' + amt.amount + ' ' + cItem + ', your total is $' + total + '. Thank you for your business!')

            //close connection
            connection.end(function (e) {
              if (e) throw e
            });
          });

        // if there is not enough stock, you get this message
        } else {
          console.log("We don't have enough stock, please come back another time!")

          // close connection
          connection.end(function (e) {
            if (e) throw e
          });
        };

      });
    });
  });
});


