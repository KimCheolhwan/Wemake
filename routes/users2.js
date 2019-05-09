var express = require('express');
const request = require('request');
const fs = require('fs');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
	const subscriptionKey = '0d227d7f0af648759b37b85b7eb5a5c3';
	const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';
	var url = req.body.action.detailParams.secureimage.origin;
	url = url.substr(5,url.length-6);
	var urlarray = new Array();
	const params = {
		'language': 'en',
		'detectOrientation': 'true',
	};
	const options = {
		uri: uriBase,
		qs: params,
		body:'{"url": ' + '"' + url + '"}',
		headers: {
			'Content-Type': 'application/json',
			// 'Content-Type': 'application/octet-stream',
			'Ocp-Apim-Subscription-Key' : subscriptionKey
		}
	}
	request.post(options, (error, response, body) => {
		var money="0";
		var date;
		var approval_number;
		var business_number;
		if (error) {
			console.log('Error: ', error);
			return;
		}

		let jsonResponse = JSON.stringify(JSON.parse(body).regions, null,' ');
		var json = JSON.parse(body);
		for(var i=0;i<json.regions.length;i++){
			for(var j=0;j<json.regions[i].lines.length ;j++){
				for(var z=0;z<(json.regions[i].lines[j].words.length);z++){
					contents = json.regions[i].lines[j].words[z].contents;
					//숫자 오류 변경
					contents = contents.replace(/l/g,"1");
					contents = contents.replace(/o/g,"0");
					contents = contents.replace(/±/g,"2");
					contents = contents.replace(/s/g,"2");
					//date 추출
					// if(contents.match('((19|20)[0-9]{2}|[0-9]{2})[/.-](0[1-9]|1[012])[/.-](0[1-9]|[12][0-9]|3[0-1])*') && date == undefined){
					if(contents.match('((19|20)[0-9]{2}|[0-9]{2})[/.-](0[1-9]|1[012])[/.-](0[1-9]|[12][0-9]|3[0-1])') && date == undefined){
						date = contents.replace(/20/,"");
						date = date.replace(/[.-]/g,"/")
						var idx = date.indexOf('/')
						date = date.substring(idx - 2,idx + 6)
					}
					//approval_number 추출
					if((contents.match("^([0-9]{8})$") || contents.match("([:.][0-9]{8})")) && approval_number == undefined){
						if(contents.match("[:.]")){
							if(contents.indexOf(':')>=0){
								var idx = contents.indexOf(':');
								approval_number = contents.substr(idx+1,8)
							}else if(contents.indexOf(".")>=0){
								var idx = contents.indexOf('.');
								approval_number = contents.substr(idx+1,8)
							}else if(contents.indecOf("/")>=0){
								var idx = contents.indecOf('/');
								approval_number = contents.substr(idx+1,8)
							}

						}
						else{
							approval_number = contents.substr(0,8);
						}
						console.log("@@@@@@@@@@@@@" + approval_number);
					}

					//business_number 추출
					if(contents.match("[0-9]{3}-[0-9]{2}-[0-9]{5}")){
						var idx = contents.indexOf('-')
						business_number = contents.substring(idx - 3,idx + 9)
					}
					//money 추출
					// if(contents.match("^([1-9]+|[0-9]{1,3}([.,][0-9]{3})*)?$")){
					if(contents.match("([0-9]{1,3})[.,]([0-9]{3})")){
						var tmp = contents.replace(/[,.]/g,"");
						for(var a=0 ; a<tmp.length ;a++){
							if(isNaN(Number(tmp[a]))){
								tmp = tmp.substr(0,a)
								break;
							}
						}
						if(tmp.charAt(tmp.length-1) == '1'){
							tmp = tmp.slice(0,-1);
						}
						if(parseInt(tmp) > parseInt(money) && Number(tmp) < 1000000){
							money = tmp;
						}
					}
				}
				// //approval_number 추출
				// if((text.match("^([0-9]{8})$") || text.match("([:.][0-9]{8})")) && approval_number == undefined){
				// 	if(text.match("[:.]")){
				// 		if(text.indexOf(':')>=0){
				// 			var idx = text.indexOf(':');
				// 			approval_number = text.substr(idx+1,8)
				// 		}else if(text.indexOf(".")>=0){
				// 			var idx = text.indexOf('.');
				// 			approval_number = text.substr(idx+1,8)
				// 		}else if(text.indecOf("/")>=0){
				// 			var idx = text.indecOf('/');
				// 			approval_number = text.substr(idx+1,8)
				// 		}
				//
				// 	}
				// 	else{
				// 		approval_number = text.substr(0,8);
				// 	}
				// 	console.log("@@@@@@@@@@@@@" + approval_number);
				// }
				//
				// //business_number 추출
				// if(text.match("[0-9]{3}-[0-9]{2}-[0-9]{5}")){
				// 	var idx = text.indexOf('-')
				// 	business_number = text.substring(idx - 3,idx + 9)
				// }
				// //money 추출
				// // if(text.match("^([1-9]+|[0-9]{1,3}([.,][0-9]{3})*)?$")){
				// if(text.match("([0-9]{1,3})[.,]([0-9]{3})")){
				// 	var tmp = text.replace(/[,.]/g,"");
				// 	for(var a=0 ; a<tmp.length ;a++){
				// 		if(isNaN(Number(tmp[a]))){
				// 			tmp = tmp.substr(0,a)
				// 			break;
				// 		}
				// 	}
				// 	if(tmp.charAt(tmp.length-1) == '1'){
				// 		tmp = tmp.slice(0,-1);
				// 	}
				// 	if(parseInt(tmp) > parseInt(money) && Number(tmp) < 1000000){
				// 		money = tmp;
				// 	}
				// }
			}
		}
		const responseBody = {
			outputs: {
				date : date,
				money : money,
				business_number : business_number,
				approval_number : approval_number
			}
		};
		res.status(200).send(responseBody);
	});
});
module.exports = router;
