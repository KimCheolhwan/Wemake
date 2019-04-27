var createError = require('http-errors');
const url = require('url');
const fs = require('fs');
// const fileUrl = require('file-url');
const request = require('request');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
// var cv = require('opencv');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var Tesseract = require('tesseract.js');
// var tesseract = require('node-tesseract-ocr');
var app = express();
const config = {
  lang: 'eng',
  oem: 0,
  psm: 3
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.listen(80,function(req,res){
   const path = __dirname + '/public/images/new18.jpg';
  fs.readFile(path,function(err,data){
     if(err) throw err;
     const subscriptionKey = '09784b26621c4e418fec4b7fc9d64a3a';
     const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';
     const imageUrl = 'https://img.insight.co.kr/static/2016/04/05/700/4t972q6zb7074jj5a8o2.jpg';
     // Request parameters.
     const params = {
         'language': 'en',
         'detectOrientation': 'true',
     };
     const options = {
         uri: uriBase,
         qs: params,
         // body:'{"url": ' + '"' + imageUrl + '"}',
         body: data,
         headers: {
             // 'Content-Type': 'application/json',
             'Content-Type': 'application/octet-stream',
             'Ocp-Apim-Subscription-Key' : subscriptionKey
         }
     };
     request.post(options, (error, response, body) => {
       var money="0";
       var date;
       var approval_number;
       var business_number;
       if (error) {
         console.log('Error: ', error);
         return;
       }

       let jsonResponse = JSON.stringify(JSON.parse(body).regions, null, '  ');
       var json = JSON.parse(body);
       for(var i=0;i<json.regions.length;i++){
         for(var j=0;j<json.regions[i].lines.length;j++){
           var text = '';
           for(var z=0;z<(json.regions[i].lines[j].words.length);z++){
             contents = json.regions[i].lines[j].words[z].text;
             //숫자 오류 변경
             // contents = contents.replace(/\?/g,"7");
             // contents = contents.replace(/이/g,"01");
             // contents = contents.replace(/!/g,"1");
             // console.log(contents);
             //date 추출
             if(contents.match('^((19|20)[0-9]{2}|[0-9]{2})[/.-](0[1-9]|1[012])[/.-](0[1-9]|[12][0-9]|3[0-1])*')){
              date = contents.replace(/^20/,"");
              date = date.replace(/[.-]/g,"/")
              date = date.substr(0,8)
             }
             //approval_number 추출
             if(contents.match("^([0-9]{8})$")){
               approval_number = contents
             }
           text += contents;
           }
           console.log(text + "     " + i);

           //money 추출
           if(text.match("^([1-9]+|[0-9]{1,3}([.,][0-9]{3})*)?$")){
             var tmp = text.replace(/[,.]/g,"");
             if(parseInt(tmp) > parseInt(money)){
              money = tmp;
             }
           }
           //business_number 추출
           if(text.match("[0-9]{3}-[0-9]{2}-[0-9]{5}")){
              var idx = text.indexOf('-')
              business_number = text.substring(idx - 3,idx + 9)
           }
         }
       }

       //Date = @@@@/@@/@@
       console.log("date : " + date);
       //Money = @@@@@@
       console.log("money : " + money);
       //business_number = @@@-@@-@@@@@
       console.log("business_number : " + business_number)
       console.log("approval_number : " + approval_number)
     });
  });
  // console.log("Port number 80 open success!")

  // cv.readImage(__dirname + '/public/images/1.jpg', function (err, img) {
  //    if (err) throw err;
  //    img.convertGrayscale();
  //    img.save(__dirname + '/public/images/test.jpg');
  //
  //  });

   // Tesseract.recognize(__dirname + '/public/images/test.jpg',config)
   //   .progress(message => console.log('progess : ',message))
   //   .catch(err => console.error("ERROR :: " , err))
   //   .then(result => console.log(result.text))
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
