var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Require all models
var db = require("./models");

app.use(logger("dev"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("views/public"));


app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");


// // Connect to the Mongo DB
mongoose.connect("mongodb://localhost/news", {useNewUrlParser: true});

app.get("/scrape", function (req, res) {

  axios.get("https://news.yahoo.com/").then(function (response) {

    // Load the Response into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $("h3").each(function (i, element) {
      // Save the text of the element in a "title" variable
      var headline = $(element).text();
      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var summary = $(element).next().text();
      var url = "https://news.yahoo.com" + $(element).children().attr("href");

      // Save these results in an object that we'll push into the results array we defined earlier
      if (headline && url != 'https://news.yahoo.comundefined' && summary && i < 10) {

        results.push({
          Headline: headline,
          Summary: summary,
          URL: url
        });
      }

    });
    res.render("index", {result: results});
  });
});

app.post("/save", function (req, res) {
  // Create and save a new Articles document to the db
  db.Article.create(req.body)
    .then(function (dbNews) {
      // If saved successfully, print the new Library document to the console
      console.log(dbNews);
    })
    .catch(function (err) {
      // If an error occurs, print it to the console
      console.log(err.message);
    });
});

app.post("/delete", function (req, res) {
  db.Article.deleteOne(req.body, function(err, obj){
    if (err) throw err;
    console.log("1 record deleted");
  });
});

app.post("/comment", function (req,res){
  db.Comment.create(req.body)
  .then(function(dbComment) {
    // If a Book was created successfully, find one library (there's only one) and push the new Book's _id to the Library's `books` array
    // { new: true } tells the query that we want it to return the updated Library -- it returns the original by default
    // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    return db.Article.findOneAndUpdate({}, { $push: { comment: dbComment._id } }, { new: true });
  })
  .then(function (dbNews){
    console.log(dbNews);
  })
  .catch(function (err) {
    console.log(err.message);
  });
});

app.get("/comments/:id", function (req, res){

  db.Comment.find({"_id": req.params.id})

  // console.log(db.Comment.find({"_id": db.Article.find({})}));
  // db.Comment.find({"_id": "5dfe75a5750916057497f52c"})
  .then(function(dbComment){
    console.log(dbComment[0].comment);
    res.json(dbComment[0].comment)
  })
  .catch(function(err){
    res.json(err);
  })
});

// Root get route
app.get("/", function (req, res) {
  res.render("index");
});

app.get("/saved", function (req, res) {
  db.Article.find({})
    // Specify that we want to populate the retrieved libraries with any associated books
    .populate("articles")
    .then(function(dbNews) {
      res.render("saved", {result: dbNews})
      // res.json(dbNews);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});