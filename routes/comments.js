var express = require("express");
var router  = express.Router({mergeParams: true});
var item = require("../models/item");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find item by id
    console.log(req.params.id);
    item.findById(req.params.id, function(err, item){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {item: item});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup item using ID
   item.findById(req.params.id, function(err, item){
       if(err){
           console.log(err);
           res.redirect("/items");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               console.log(item);
               item.comments.push(comment);
               console.log(item);
               item.save();
               console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/items/' + item._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", middleware.isLoggedIn, function(req, res){
    // find item by id
    Comment.findById(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
             res.render("comments/edit", {item_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:commentId", function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
           res.render("edit");
       } else {
           res.redirect("/items/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId",middleware.checkUserComment, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err){
        if(err){
            console.log("PROBLEM!");
        } else {
            res.redirect("/items/" + req.params.id);
        }
    })
});

module.exports = router;