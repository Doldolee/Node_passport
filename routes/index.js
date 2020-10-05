const { request } = require('express');
var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth')

// function authIsOwner(request, response){
//   if(request.session.is_logined){
//     return true;
//   }else{
//     return false;
//   }
// }

// function authStatusUI(request, response){
//   var authStatusUI = `<a href="/auth/login">login</a>`
//   if(authIsOwner(request,response)){
//     authStatusUI = `${request.session.nickname}|<a href="/auth/logout">logout</a>`
//   }
//   return authStatusUI
// }

router.get('/', function(request,response){
  // console.log('/', request.user); //user객체는 deserizeuser의 콜백함수 done의 두번 째 인자이다.(passport사용할 경우 user라는 객체가 request에 생성됨)
  var fmsg = request.flash(); //로그인 실패 후 redirect로 다시 돌어왔을 때 flash가 있다면
  var feedback = '';
  if (fmsg.success){
    feedback = fmsg.success[0];
  }
  var title = 'welcome';
  var description = 'Hello, Node.js ';
  var list = template.List(request.list);
  var html = template.HTML(title,list, 
    body=`
    <div>${feedback}</div>
    <h2>${title}</h2>${description}
    <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
    `, 
    control=`<a href="/topic/create">create</a>`,
    auth.statusUI(request, response));
  // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
  response.send(html);

});

module.exports=router;