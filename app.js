const express = require('express');
const router = express.Router();
const app = express();
const path = require('path');
const hbs = require('hbs');
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const newItemList = require('./models/newItemList');
const popItemList = require('./models/popItemList');
const User = require('./models/User');
const flash = require('connect-flash');
const session = require('express-session');
const db = require('./config/keys').MongoURI;
const passport = require('passport');
const {ensureAuth} = require('./config/auth');
require('./config/passport')(passport);
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({defaultLayout: 'layout',
  extname: '.hbs',
  layoutsDir:__dirname + '/views/layouts/',
  partialsDir:__dirname + '/views/partials/',
  handlebars: allowInsecurePrototypeAccess(Handlebars)}));


app.get('/', function (req, res) {
    newItemList.find(newItemList).exec()
        .then(newItemList => {
        popItemList.find(popItemList).exec()
            .then(popItemList =>  {
                res.render('index', { title : 'تایم زون' , newItemList: newItemList, popItemList: popItemList});
            });
        });
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/users', require('./Routes/users'));

app.get('/reqNew', ensureAuth, function (req, res) {
    res.render('reqNew');
});

app.get('/item/:id', ensureAuth,function (req, res) {
  res.render('item', {_id: req.params.id});
});

app.put('/item/:id', function(req, res){
  popItemList.updateOne({_id: req.params.id},{
    title: req.body.title,
    cost: req.body.cost,
    image: req.body.image }, function(err, docs){
      if(err) res.json(err);
      else 
        res.redirect('/');
      });
});
   
  app.param('id', function(req, res, next, id){
  popItemList.findById(id, function(err, docs){
  if(err) res.json(err);
  else
  {
    _id = docs;
    next();
  }
  });
  });

app.get('/:id', ensureAuth, (req, res ) => {
  popItemList.findByIdAndDelete({_id: req.params.id}, function (err, docs) { 
    if (err){ 
        console.log(err) 
    } 
    else{
        res.redirect('/');
    }});
});

app.post("/reqNew", (req, res) => {
  var myData = new newItemList(req.body);
  myData.save()
    .then(item => {
      res.redirect('/');
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
});

mongoose.connect(db, {useNewUrlParser:true, useUnifiedTopology: true})
.then(()=>console.log('db connected'))
.catch(err=>console.log(err));



app.listen(8080, function () {
    console.log('listening 8080');
});