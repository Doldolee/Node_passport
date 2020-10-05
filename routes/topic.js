var express =require('express')
var router = express.Router();
var path = require('path')
var fs = require('fs')
var sanitizeHtml = require('sanitize-html')
var template = require('../lib/template.js');
var auth = require('../lib/auth');

router.get('/create', function(request, response){
  if (!auth.isOwner(request,response)){
    response.redirect('/');
    return false
  }
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
     </form>`,'',auth.statusUI(request, response));
  // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
  response.send(html);
});

router.post('/create_process', function(request, response){
  /*
  var body=''
      request.on('data', function(data){
        body = body+data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, `utf8`, function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        })
      });
      */
    if (!auth.isOwner(request,response)){
      response.redirect('/');
      return false
    }
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, `utf8`, function(err){
      response.redirect(`/topic/${title}`);
  });
});

router.get('/update/:pageId', function(request, response){
  if (!auth.isOwner(request,response)){
    response.redirect('/');
    return false
  }
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
    control=`<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,auth.statusUI(request, response));
    // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
    response.send(html);
});
});

router.post('/update_process', function(request, response){
  if (!auth.isOwner(request,response)){
    response.redirect('/');
    return false
  }
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
  if (!auth.isOwner(request,response)){
    response.redirect('/');
    return false
  }
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
        </form>`,auth.statusUI(request, response));
        // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
        response.send(html);
      }
});
});

module.exports = router;