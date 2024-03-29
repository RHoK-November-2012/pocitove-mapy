/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , maps = require('./routes/maps')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({secret: 'tajnehesloprosessiony'}));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req,res){
    res.render('404');
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);


app.post('/login', user.login);
app.get('/logout', user.logout);

app.get('/register', user.get_register);
app.post('/register', user.post_register);


app.get('/maps', maps.list);
app.get('/maps/:mapId/show', maps.show);
app.get('/maps/:mapId/fill', maps.fill);
app.post('/maps/:mapId/save', maps.save);
app.get('/maps/:mapId/shapes', maps.shapes);

app.get('/kml/:mapId', maps.create_kml);

app.get('/maps/design', maps.design);
app.get('/maps/:mapId/edit', maps.edit);
app.post('/maps/create', maps.create);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
