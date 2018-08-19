//////////////////
//Other Settings//
//////////////////
var fs = require('fs');

//////////////////////////////
//express setup and settings//
//////////////////////////////
var express = require('express');
var app = express();
app.use(express.urlencoded({extended: true})); //so can parse POST/FORM data as javascript object automaticaly.
app.use(express.static('styles'));
app.use(express.static('assets'));
app.use(express.static('scripts'));
app.set('view engine', 'ejs'); //default render engine = ejs (instead of html I guess).

////////////////////////
//mongoose and mongoDB//
////////////////////////
var mongoose = require('mongoose').set('debug', true);
mongoose.connect("mongodb+srv://forNodejs:forNodejs@cluster0-zniag.mongodb.net/AvalonWeb?retryWrites=true");
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {console.log("Connected to MongoDB succesfuly!");});

//-> user
//Define a schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id: String,
    user: {type: String, minlength: [2,'אימייל קצר מדי'],maxlength: [10,'אימייל ארוך מדי']},
    pass: String,
    level: String
},{ collection: 'users' });

var userModel = mongoose.model('users', userSchema );

////////////////////
//Session Handling//
////////////////////
var session = require('client-sessions');

//session settings
app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
  }));

//middleware - manager
app.use(function(req, res, next) {
    if (req.session && req.session.user) {
      userModel.findOne({ user: req.session.user.user }, function(err, user) {
        if (user) {
          req.user = user;
          delete req.user.password; // delete the password from the session
          req.session.user = user;  //refresh the session value
          res.locals.user = user.user;
          res.locals.userobj = user;
        }
        // finishing processing the middleware and run the route
        next();
      });
    } else {
    req.session.reset();
    console.log("user NO SESSION " + req.session.user);
      next();
    }
  });

  function requireLogin (req, res, next) {
    if (!req.user) {
        //redirect
            //set data
        var path = encodeURIComponent(req.path);
        console.log(path);
        //redirect now
        res.redirect('/login?redirect=' + path);
    } else {
      next();
    }
  };

//////////
//Router//
//////////

//GET REQUESTS
app.get('/',function(req,res) {
    if (req.session && req.session.user) { // Check if session exists
        // lookup the user in the DB by pulling their email from the session
        res.render('index',{user: req.session.user.user});
    }
    else
    {
        req.session.reset();
        res.render('index');
    }
       
});

app.get('/userdash',requireLogin,function(req,res) {
    userModel.find({},function(err, users) {

        if (err) { console.log(err); res.render('userdash',{users: ""});  throw err; return;} //if there was an error then stop.
        
        res.render('userdash',{users: users});
    });
    
});


app.get('/cards',requireLogin,function(req,res) {
    var fs = require('fs'); 
    var files = fs.readdirSync('./assets/images/cards');
    res.render('cards',{files: files });
});

app.get('/profile',requireLogin, function(req, res) {
    res.render('profile');
});

app.get('/login',function(req,res) {
     res.render('login',{redirect: req.query.redirect});
});

app.get('/register',function(req,res) {
    res.render('register');
});

app.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
});

app.get('/:path', function(req,res) {
    console.log("req params: "+req.params.path);
    res.render(req.params.path, {}, function(err, html) {
        if(err) {
            res.render('404');
        } else {
            res.send(html);
        }
    });
   

});


//POSTS REQUESTS
app.post("/login", function(request, response) {
    login_user(request,response);
 });
 function login_user (request,response) {
     //find in database username corresponds to user input
    userModel.findOne({'user':request.body.user},function(err, user) {
        if (err) { console.log(err); throw err; return;}; //if there was an error then stop.

        if(user !== null) //if found any results
        {
            console.log("user findone login: " +user.user);
            if(request.body.user == user.user && request.body.pass == user.pass) //if results match
            {
                request.session.user = user;
                if(!request.body.redirect)
                    response.render('index',{user: user.user});
                    else
                    response.redirect(request.body.redirect.slice(1));
                return;
            }
        }

        response.render('index');
    });
 }

app.post('/register', function(req,res) {
var u = new userModel ({
    id: "debugOnly",
    user: req.body.user,
    pass: req.body.pass,
    level:"1"
});

//validate values // DEBUG ONLY, can be removed as the progam does it automatically
var error = u.validateSync();
console.log(error);
    
u.save(function(err, user){
    if(err) {
        console.log(err);
        console.log(err.errors);
        console.log(err.message);
        res.render('register',{message: err.message})
    }
    else{
        console.log("SAVED! Maybe...");
        console.log(user);
        console.log(req.body.user);
        req.body.user = user.user; 
        login_user(req,res);
    }
    });

});


app.post('/delete',requireLogin, function(req,res) {
    console.log(req.body.user );
    userModel.deleteOne({ user: req.body.user }, function (err) {
        if (err) return handleError(err);
        // deleted
        res.send('deleteduser');
      });
});

app.post('/passwordchange',requireLogin, function(req,res){
    console.log(req.body.userstringid );
    console.log(req.body.newpass);
    userModel.updateOne({_id: req.body.userstringid },{pass: req.body.newpass},function(err){
        if (err) return handleError(err);
        //updated
        res.send('password change succesfuly');
    });
});

//////////////////////////////////////
//server start - > listen to port 80//
//////////////////////////////////////
port = 80; //for debug - offline use.
//var port = process.env.PORT; //for Heroku or server
app.listen(port, process.env.IP); 
console.log('-> Server is listening to port '+port+' <-');