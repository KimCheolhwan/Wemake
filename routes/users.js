var express = require('express');
const request = require('request');
const fs = require('fs');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
   const path = __dirname + '/../public/images/new10.jpg';
  fs.readFile(path,function(err,data){
     if(err) throw err;
     const subscriptionKey = '09784b26621c4e418fec4b7fc9d64a3a';
     const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';
     const imageUrl = 'https://img.insight.co.kr/static/2016/04/05/700/4t972q6zb7074jj5a8o2.jpg';
     // Request parameters.
     const params = {
         'language': 'ko',
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
       var money="";
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
             contents = contents.replace(/\?/g,"7");
             contents = contents.replace(/이/g,"01");
             contents = contents.replace(/!/g,"1");
             // console.log(contents);
             //date 추출
             if(contents.match('^((19|20)[0-9]{2}|[0-9]{2})[/-](0[1-9]|1[012])[/-](0[1-9]|[12][0-9]|3[0-1])*')){
              date = contents.replace(/^20/,"");
              date = date.replace(/-/g,"/")
              date = date.substr(0,8)
             }
             //approval_number 추출
             if(contents.match("^([0-9]{8})$")){
               approval_number = contents
             }
           text += contents;
           }
           // console.log(text + "     " + i);

           //money 추출
           if(text.match("^([1-9]+|[0-9]{1,3}([.,][0-9]{3})*원?)?$")){
             if(text.replace(/[,.원]/g,"") > money.replace(/[,.원]/g,"")){
              money = text.replace(/[,.원]/g,"");
             }
           }
           //business_number 추출
           if(text.match("[0-9]{3}-[0-9]{2}-[0-9]{5}")){
              var idx = text.indexOf('-')
              business_number = text.substring(idx - 3,idx + 9)
           }
         }
       }
       //DB와 비교 추가하기
       if(date==undefined | money=="" | business_number==undefined | approval_number==undefined){
         const responseBody = {
             outputs: {
               success: false
             }
         };
         res.status(200).send(responseBody);
       }else{
         const responseBody = {
             outputs: {
               date : date,
               money : money,
               business_number : business_number,
               approval_number : approval_number,
               success : true,
             }
         };
         res.status(200).send(responseBody);
       }
     });
  });
});

module.exports = router;
