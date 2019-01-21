const express =  require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var cors = require('cors');
const _ = require('lodash');
// const logger = require('morgan');

const app = express();
const port = process.env.PORT || 3000;
const server = app.listen(port);

const io = require('socket.io').listen(server);
app.use(cors());




const { User } = require('./Helpers/UserClass');

require('./socket/streams')(io, User, _);
require('./socket/private')(io);

const dbConfig  = require('./config/secret');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true });



const user = require('./routes/userRoutes')
const auth = require('./routes/authRoute');
const friend = require('./routes/friendRoutes');
const message = require('./routes/messageRoutes');
const image = require('./routes/imageRoutes');


var jsonParser       = bodyParser.json({limit:1024*1024*20, type:'application/json'});
var urlencodedParser = bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoding' })

app.use(jsonParser);
app.use(urlencodedParser);
app.use(cookieParser());
// app.use(logger('dev'));






app.use('/api',auth);
app.use('/api', message);
app.use('/api', image);
app.use('/api',user);
app.use('/api', friend);
