var express =require('express')
var router = express.Router();
var path = require('path')
var fs = require('fs')
var sanitizeHtml = require('sanitize-html')
var template = require('../lib/template.js');
var db = require('../lib/db');
var shortid = require('shortid');

// var authData = {
//   email:'egoing777@gmail.com',
//   password:'111111',
//   nickname:'egoing'
// }

module.exports = function(passport){
  router.get('/login', function(request, response){
    var fmsg = request.flash(); //로그인 실패 후 redirect로 다시 돌어왔을 때 flash가 있다면
    var feedback = '';
    if (fmsg.error){
      feedback = fmsg.error[0];
    }
    var title = 'WEB - login'; 
    var list = template.List(request.list);
    var html = template.HTML(title,list, 
      `<div style="color:red">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        
        <p><input type="submit" value="login"></p>
       </form>`,'');
    // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
    response.send(html);
  });
  /*
  router.post('/login_process', function(request, response){
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    if (email === authData.email && pwd===authData.password){
      //세션 정보를 줌
      request.session.is_logined = true;
      request.session.nickname = authData.nickname;
      request.session.save(function(){
        response.redirect(`/`);
      });
      
    }else{
      response.send('who')
    }
  });
  */
  
  //사용자가 로그인ㅇ르 정보를 전송했을 때 passport가 결과를 처리하기 위한 코드
  router.post('/login_process',
    passport.authenticate('local',{
      successRedirect:'/',
      failureRedirect:'/auth/login',
      failureFlash:true, //flash메시지 사용 /세션에 flash메시지가 저장됨(ex,실패시 incorrect username)
      successFlash:true //성공 flash 메시지
    }));
  
    router.get('/register', function(request, response){
      var fmsg = request.flash(); //로그인 실패 후 redirect로 다시 돌어왔을 때 flash가 있다면
      var feedback = '';
      if (fmsg.error){
        feedback = fmsg.error[0];
      }
      var title = 'WEB - login'; 
      var list = template.List(request.list);
      var html = template.HTML(title,list, 
        `<div style="color:red">${feedback}</div>
        <form action="/auth/register_process" method="post">
          <p><input type="text" name="email" placeholder="email"></p>
          <p><input type="password" name="pwd" placeholder="password"></p>
          <p><input type="password" name="pwd2" placeholder="password"></p>
          <p><input type="text" name="displayName" placeholder="display name"></P>
          <p><input type="submit" value="register"></p>
         </form>`,'');
      // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
      response.send(html);
    });

    router.post('/register_process', function(request, response){
        var post = request.body;
        var email = post.email;
        var pwd = post.pwd;
        var pwd2 = post.pwd2;
        var displayName = post.displayName;
        if(pwd !== pwd2){
          request.flash('error', 'passowrd must same!');
          response.redirect('/auth/register');
        }else{
          var user ={
            id:shortid.generate(), //중복 방지를 위해 임의로 생성
            email:email,
            password:pwd,
            displayName:displayName
          }
          db.get('users').push(user).write();  //회원가입 후 바로 로그인 하는 프로세스
          request.login(user, function(err){  //로그인 시 객체로 회원정보(user)를 넘김
            return response.redirect('/')
          })
          
        }
    });


  router.get('/logout', function(request, response){
    request.logout();
    // request.session.destroy(function(err){
    //   response.redirect('/');
    // });
    request.session.save(function(){
      response.redirect('/');
    })
  });
  return router;
}




















/*
router.get('/create', function(request, response){
  
  var title = 'WEB - create'; 
  var list = template.List(request.list);
  var html = template.HTML(title,list, 
    `<form action="/topic/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
          <input type="submit">
      </p>
     </form>`,'');
  // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
  response.send(html);
});

router.post('/create_process', function(request, response){

    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, `utf8`, function(err){
      response.redirect(`/topic/${title}`);
  });
});

router.get('/update/:pageId', function(request, response){
 
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err,data){
    var title = request.params.pageId;
    var list = template.List(request.list);
    var description = data;
    var html = template.HTML(title,list, 
    `<form action="/topic/update_process" method="post">
    <input type="hidden" name="id" value="${title}">
    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
    <p>
      <textarea name="description" placeholder="description">${description}</textarea>
    </p>
    <p>
        <input type="submit">
    </p>
   </form>
      
    `,
    control=`<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`);
    // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
    response.send(html);
});
});

router.post('/update_process', function(request, response){
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error){
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/topic/${title}`);
    })
});
});

router.post('/delete_process', function(request,response){
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(error){
    response.redirect('/');
  });
});


router.get('/:pageId', function(request, response, next){
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err,data){
      if(err){
        next(err);
      }else{
        var title = request.params.pageId;
        var list = template.List(request.list);
        var description = data;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description)
        var html = template.HTML(sanitizedTitle,list, 
        body=`<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        control=`<a href="/topic/create">create</a> 
        <a href="/topic/update/${sanitizedTitle}">update</a>
        <form action="/topic/delete_process" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>`);
        // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
        response.send(html);
      }
});
});
*/


// module.exports = router;