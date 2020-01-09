var express = require("express");
var router  = express.Router();
var item = require("../models/item");
var middleware = require("../middleware");
var request = require("request");

//INDEX - show all items
router.get("/", function(req, res){
    // Get all items from DB
    item.find({}, function(err, allitems){
       if(err){
           console.log(err);
       } else {
           request('https://maps.googleapis.com/maps/api/geocode/json?address=sardine%20lake%20ca&key=AIzaSyBtHyZ049G_pjzIXDKsJJB5zMohfN67llM', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body); // Show the HTML for the Modulus homepage.
                res.render("items/index",{items:allitems});

            }
});
       }
    });
});

//CREATE - add new item to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to items array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newitem = {name: name, image: image, description: desc, author:author}
    // Create a new item and save to DB
    item.create(newitem, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to items page
            console.log(newlyCreated);
            res.redirect("/items");
        }
    });
});

//NEW - show form to create new item
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("items/new"); 
});

// SHOW - shows more info about one item
router.get("/:id", function(req, res){
    //find the item with provided ID
    item.findById(req.params.id).populate("comments").exec(function(err, founditem){
        if(err){
            console.log(err);
        } else {
            console.log(founditem);
            //render show template with that item
            res.render("items/show", {item: founditem});
        }
    });
});

router.get("/:id/edit", middleware.checkUseritem, function(req, res){
    console.log("IN EDIT!");
    //find the item with provided ID
    item.findById(req.params.id, function(err, founditem){
        if(err){
            console.log(err);
        } else {
            //render show template with that item
            res.render("items/edit", {item: founditem});
        }
    });
});

router.put("/:id", function(req, res){
    var newData = {name: req.body.name, image: req.body.image, description: req.body.desc};
    item.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, item){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/items/" + item._id);
        }
    });
});


middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be signed in to do that!");
    res.redirect("/login");
}

module.exports = router;

