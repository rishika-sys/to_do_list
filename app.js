//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB",
{ useUnifiedTopology: true},
{ useFindAndModify: false }
);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//creating item schema
const itemSchema = new mongoose.Schema({
  name: String
});

//model has to be singular hence we are writing "item"
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to To-Do-List"
});
const item2 = new Item({
  name: "Hit + to add a new item"
});
const item3 = new Item({
  name: "Hit x to delete the item"
});

const defaultArray = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);
// to insert all the items in db
// Item.insertMany([item1,item2,item3],function(err){
//   if(err)
//   console.log(err);
//   else
//   console.log("Items added successfully");
// });

//display each item in console window in hyper.
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultArray, function(err) {
        if (err)
          console.log(err);
        else
          console.log("Items added successfully");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
  // const day = date.getDate();
});
app.get("/:itemName", function(req, res) {
  const itemName = _.capitalize(req.params.itemName);

  List.findOne({
    name: itemName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list()
        const list = new List({
          name: itemName,
          items: defaultArray
        });
        list.save();
        res.redirect("/" + itemName);
        // console.log("Doesnt exists");
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
        // console.log("Exists");
      }
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName == "Today") {
    item.save();
    res.redirect("/");
  }
  //we are using this else so that whenever we add newe item in  any of the other lists(like school,work,etc) it gets reflected there itself.
  else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // const item=mongoose.model("ItemName",itemSchema);
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  //Its an inbuilt function findByIdAndRemove to search by id and delete the item.
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully removed");
        // console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id : checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
});
  }
});
app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
