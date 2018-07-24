var express        = require("express");
var morgan         = require("morgan");
var mongoose       = require("mongoose");
var ejs            = require("ejs");
var engine         = require("ejs-mate");
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");
//models
var Item           = require("./models/items");
var app = express();

var Port = process.env.PORT||3000;


// Database connection to Mlab 
mongoose.connect("mongodb://root:abc123@ds247191.mlab.com:47191/foodrecipe", function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Connected to Database")
    }
});
//middlewares
app.use(morgan('dev'));
app.engine('ejs', engine);
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"))

//Routes


//Home Route
app.get("/", function(req, res){
    res.render("main/home")
});

// About Page route 
app.get("/about", function(req, res){
    res.render("main/about");
});

//Sorting Routes
//1. Sort - recency
app.get("/recipes/alpha", function(req, res){
    Item.find({}, function(err, allRecipes){
        if(err){
            console.log(err)
        }else{
            var message = "Alphabetical Sort";
            var recipes = allRecipes.slice(0);
            allRecipes.sort(function(a, b){
                var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1 
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            res.render("main/sort", {recipes : recipes, allRecipes: allRecipes, message : message});
        }
    })
});

//2. Sort - Recency
app.get("/recipes/recency", function(req, res){
    Item.find({}, function(err, allRecipes){
        if(err){
            console.log(err);
        }else{
            var message = "Sorted by recency";
            var recipes = allRecipes.slice(0);
            res.render("main/sort", {recipes: recipes, allRecipes:allRecipes.reverse(), message: message});
        }
    })
});


//3. Sort - Rating
app.get("/recipes/rating", function(req, res){
    Item.find({}, function(err, allRecipes){
        if(err){
            console.log(err)
        }else{
            var message = "Sorted By Rating"
            var recipe = allRecipes.slice(0);
            allRecipes.sort(function(a,b){return a.rating-b.rating});
            allRecipes.reverse();
            res.render("main/sort", {recipes :recipe, allRecipes : allRecipes, message : message})
        }
    });
})

//Create a new recipe Form route
app.get("/add", function(req, res){
    res.render("main/add");
});

//Adding the new recipe to the database
app.post("/add", function(req, res, next){
    var item = new Item();
    item.name = req.body.name;
    item.image = req.body.image;
    item.hot = req.body.hot + " Mins";
    item.total_time = req.body.total_time + " Mins";
    item.yields = "Serves " + req.body.yields;
    item.ingredients = req.body.ingredients;
    item.nutrition_info = req.body.nutrition_info;
    item.steps = req.body.steps;
    item.desc = req.body.desc;
    item.rating = req.body.rating;
    console.log(req.body);
    item.save(function(err){
        if(err) return next(err);
        res.redirect("/recipes");
    });
});

//List all the recipes
app.get("/recipes", function(req, res){
    Item.find({}, function(err, allRecipes){
        if(err){
            console.log(err)
        }else{
            res.render("main/recipes", {recipes : allRecipes});
        }
    })
});

//Individual recipes
app.get("/recipes/:id", function(req, res){
    Item.findOne({_id : req.params.id}, function(err, recipe){
        if(err){
            console.log(err);
        }else{
            var ingredients = recipe.ingredients.split("\n")
            var nutrition_info = recipe.nutrition_info.split("\n")
            var steps = recipe.steps.split("\n")
            res.render("main/recipe", {recipe : recipe, ingredients: ingredients, nutrition_info: nutrition_info, steps:steps});   
        }
    });
});


//search feature
app.post("/search", function(req, res, next){
    console.log(req.body.q);
    res.redirect("/search?q=" + req.body.q[0].toUpperCase() + req.body.q.substr(1));
})

//render search page
app.get("/search", function(req, res, next){
    var query = {}
    if(req.query.q){
        query.name = {"$regex" : req.query.q}
    }
    Item.find(query, function(err, result){
        if(err) return next(err);
        if(result.length ===0){
            var query= {}
            if(req.query.q){
            query.ingredients = {"$regex" : req.query.q.toLowerCase()}
            }
            Item.find(query, function(err, result2){
                if(err) return next(err);
                result = result2
            });
        }
        Item.find({}, function(err, recipes){
            if(err) return next(err);
            res.render("main/search", {recipes : recipes, result : result, term : req.query.q})
        });
    });
});

//Editing Routes
app.get("/recipes/:id/edit", function(req, res){
    Item.findById(req.params.id, function(err, recipe){
        if(err){
            console.log(err);
        }else{
            res.render("main/edit", {recipe : recipe});
        }
    })
});

//Update Route
app.put("/recipes/:id", function(req, res){
    // res.send(req.body);
    Item.findByIdAndUpdate(req.params.id, req.body.recipe, function(err, updatedRecipe){
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            res.redirect("/recipes/" + req.params.id);
        }
        
    })
});

//Delete Route
app.delete("/recipes/:id", function(req, res){
    Item.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            res.redirect("/recipes");
        }
    });
});



//Gallery Route...
app.get("/gallery", function(req, res){
    res.render("main/gallery");
});

//contact page -Dummy page *******DOESN'T DO ANYTHING************
app.get("/contact", function(req, res){
    res.render("main/contact");
})

// Listening to PORT 3000 or 8080 (or 8081- c9 defaults)
app.listen(Port, process.env.IP, function(){
    console.log("Server has started")
})