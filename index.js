const express = require('express');//initialize express
const app = express();
app.set('view engine', 'ejs');//routing for ejs files
app.use(express.static(__dirname + '/public'));//initialize a static folder public(used for css & js)
const { users } = require('./model/register');
app.set('port',process.env.PORT || 3000);//port initialization


const mongoose = require('mongoose');
const session = require('express-session');//install
const mongoconnect = require('connect-mongo')(session);//install
const {mongooseconnect}= require('./db/mongo_connection');
const passport = require('passport');//passport initialize
const LocalStrategy = require('passport-local').Strategy;


//session to be creating
var chatSession = session({
    secret: 'mdjnreju38dmjs83ki8k', //session secret key 
    resave: false,
    saveUninitialized: true,
    store: new mongoconnect({ mongooseConnection: mongoose.connection })  // session save to db
});

app.use(chatSession);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
    function(email, password, done) {
        users.findOne({email:email}).then((user)=>{
            if(user){
                if(user.password==password){
                    done(null, user);
                }else{
                    done(null,false);
                }
            }else{
                done(null,false);
            }
        })
    }
  ));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    users.findById(id, (err, user) => {
        done(err, user);
    });
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/user/login');
}

const bodyParser = require('body-parser');//body praser to get data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send('<a href="/user/register">Register</a><br><a href="/user/login">Login</a>');
})

//user page show
app.get('/user/register',(req,res)=>{
    res.render('register',{

    })
});
//register page validation
app.post('/user/register',(req,res)=>{
    var userdata = new users({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    });
    if(req.body.password===req.body.confirm_password){
        userdata.save().then(()=>{
            res.render('register');
        })
    }else{
        res.render('register');
    }
},(err)=>{
    console.log('error');
});
//user page load
app.get('/user/login',(req,res)=>{
    res.render('register',{
    })
});
//user login validation
app.post('/user/login',passport.authenticate('local', { failureRedirect: '/user/register' }),(req,res)=>{
    res.redirect('/mandapam');
});

app.get('/mandapam', isAuthenticated,(req,res)=>{
    res.render('mandapam',{
        userdata:req.user
    });
});

app.get('/logout',(req,res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/user/login');
});

app.listen(app.get('port'));