//////////////////
//Other Settings//
//////////////////
var fs = require('fs');
var iconvlite = require('iconv-lite');

function readFileSync_encoding(filename, encoding) {
    var content = fs.readFileSync(filename);
    return iconvlite.decode(content, encoding);
}

var chars = JSON.parse(readFileSync_encoding('./assets/cardsdata.json', 'CP1255')); 
console.log(chars); 
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

//////////////////////////////////////////////
// Load sensitive data (password) from file //
//////////////////////////////////////////////
// for local testing
if (!process.env.PORT) 
    var mongodb_password = readFileSync_encoding('./.passwords.txt' , 'CP1255');
else var mongodb_password = process.env.mongodb_password; // env string in Heroku app deployment settings

////////////////////////
//mongoose and mongoDB//
////////////////////////
var mongoose = require('mongoose').set('debug', true);
mongoose.connect("mongodb+srv://forNodejs:"+mongodb_password+"@cluster0-zniag.mongodb.net/AvalonWeb?retryWrites=true");
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {console.log("Connected to MongoDB succesfuly!");});

//-> user
//Define a schema
var Schema = mongoose.Schema;

var userSchema = new Schema({
    user: {type: String, minlength: [3,'שם קצר מדי'],maxlength: [10,'שם ארוך מדי']},
    pass: String,
    email: String,
    permission: String,
    score: Number,
    level: String,
    comments: [{type: Schema.Types.ObjectId, ref: "comments"}]
},{ collection: 'users' });

var userModel = mongoose.model('users', userSchema );

//-> comment
//Define a schema
var commentSchema = new Schema({
    text: String,
    author:  {type: Schema.Types.ObjectId, ref: "users"}
},{ collection: 'comments' });

var commentModel = mongoose.model('comments', commentSchema );

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
          res.locals.usershort = user.user.slice(0,user.user.indexOf('@')); //the username without the email suffix
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
        //redirect now
        res.redirect('/login?redirect=' + path);
    } else {
      next();
    }
  };

  function requirePermission (permission) {
    return function(req,res,next) {
        if(req.session.user.permission === permission)
            next();
            else //NEED TO CREATE 'DONT HAVE PERMISSIONS FOR THIS PAGE' PAGE.
            res.redirect('/accessdenied'); //TEMP
    };
  }

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

app.get('/userdash',requireLogin,requirePermission('admin'),function(req,res) {
    userModel.find({},function(err, users) {

        if (err) { console.log(err); res.render('userdash',{users: ""});  throw err; return;} //if there was an error then stop.
        
        res.render('userdash',{users: users});
    });
    
});


app.get('/cards',requireLogin,function(req,res) {
    var fs = require('fs'); 
    var files = fs.readdirSync('./assets/images/cards');

    files.sort(function(a,b){return (a.substr(0,2) - b.substr(0,2))});
   
    res.render('cards',{files: files, chars: chars });
});

app.get('/profile',requireLogin, function(req, res) {
    console.log(req.query.userid);
    if(!req.query.userid){// SHOULD MOVE IT TO THE MIDDLEWARE?
        userModel.findById(req.session.user._id).populate({path: "comments", populate:{path: "author"}}).exec(function(err, user){
            if(err) {res.render('profile',{comments: ["ERROR"]}); console.log(err); throw err}
            res.render('profile',{comments: user.comments});

    
        });
    } else  if(req.query.userid.match(/^[0-9a-fA-F]{24}$/)) {
        if(req.query.userid != req.session.user._id) {
        userModel.findById(req.query.userid).populate({path: "comments", populate:{path: "author"}}).exec(function(err, user){
            if(err || user===null) {res.render('profile',{comments: ["ERROR"]}); console.log(err); return}
            
            res.render('profile',{comments: user.comments,userlookupobj: user});
         });
        } else {res.redirect('profile'); console.log('redirecting.....')}
    }   
});

app.get('/login',function(req,res) {
     res.render('login',{redirect: req.query.redirect, message: req.query.err});
});

app.get('/register',function(req,res) {
    res.render('register');
});

app.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
});

app.get('/favicon.ico' , function(req , res) {
    res.sendfile('favicon.ico');
});

app.get('/:path', function(req,res) {
    console.log("req params: "+req.params.path);
    res.render(req.params.path, {}, function(err, html) {
        if(err) {
            console.log(':path -> Error: send 404 page.');
            res.render('404');
        } else {
            console.log(':path -> Found: send requested page.');
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
                    response.redirect('index');
                    else
                    response.redirect(request.body.redirect.slice(1));
                return;
            }
        }

        //else - if not found user or found unmatched user credentials
        var wrong = encodeURIComponent("true");
        //redirect now
        if(!request.body.redirect)
            response.redirect('/login?err=' + wrong);
            else {
                var redirect = encodeURIComponent(request.body.redirect);
                response.redirect('/login?redirect=' + redirect + "&err=" + wrong);
            }

    });
 }

app.post('/register', function(req,res) {
var u = new userModel ({
    user: req.body.user,
    pass: req.body.pass,
    email: req.body.email,
    permission: "standard",
    score:0,
    level:"1",
    comments: []
});


u.save(function(err, user){
    if(err) {

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


app.post('/delete',requireLogin,requirePermission('admin'),function(req,res) { //TODO: PASS USERID INSTEAD OF USER NAME
    console.log(req.body.user );
    userModel.deleteOne({ user: req.body.user }, function (err) {
        if (err) return handleError(err);
        commentModel.remove({author: user._id} , function(err){ 
            if (err) return handleError(err);
        })
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

app.post('/usersearch',requireLogin, function(req,res) {
    userModel.find({ user:new RegExp('^'+req.body.user) }, function (err,users) {
        if (err) return handleError(err);
        // Found
        var send_data = [];
        if(users)
        users.forEach(element => {
            send_data.push(element.user);
        });

        res.send(send_data);
      });
});


app.post('/addComment',requireLogin, function(req,res){
    userModel.findById(req.body.userstringid,function(err,user){
        if (err) {console.log(err); return err};
        //updated
        commentModel.create({text: req.body.comment, author: req.session.user},function(err,comment){
            console.log("TO: "+user.user);
            console.log("AUTHOR: "+comment.author.user);
            user.comments.push(comment);
            user.save();
        });
        res.send('Succesfuly Added :D');
    });
});
//////////////////////////////////////
//server start - > listen to port 80//
//////////////////////////////////////
var port = process.env.PORT; //for Heroku or server
if(!port) //if not on Server or container
    port = 80; //for debug - offline use.

app.listen(port, process.env.IP); 
console.log('-> Server is listening to port '+port+' <-');