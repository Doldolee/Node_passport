const express = require('express')
const app = express();
var fs = require('fs')
var template = require('./lib/template.js');
var qs = require('querystring');
const { response, request } = require('express');
var bodyParser = require('body-parser')
var compression = require('compression')
var helmet = require('helmet')
app.use(helmet());
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var flash = require('connect-flash');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
//자동으로 미들웨어가 내부적으로 request에 session 객체를 추가해줌
app.use(session({
  secret: 'keyboard cat',  //꼭 넣어주어야함
  resave:false, //세션데이터가 바뀌기전까지 저장소에 저장안함.
  saveUninitialized:true, //세션이 필요하기 전까지는 구동시키지 않는다.
  store:new FileStore() //이것을 file이 아닌 mysql로 바꾸면 mysql을 세션 스토어로 사용하는것.
}))

app.use(flash());
// app.get('/flash', function(request, response){
//   request.flash('info', 'Flash is back') //flash메소드는 세션스토어에 입력한 메시지를 추가함. 추 후 사용하면 자동으로 지워짐
//   response.send('flash')
// });

// app.get('/flash-display', function(request,response){
//   var fmsg = request.flash();
//   res.send(fmsg);
// })





var passport = require('./lib/passport')(app);




app.get('*',function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list=filelist;
    next()
  });
});

var topicRouter = require('./routes/topic')
var authRouter = require('./routes/auth')(passport);
var indexRouter = require('./routes/index');
const { serializeUser } = require('passport');


app.use('/', indexRouter)
// : /topic이라고 시작하는 주소에 topicRouter라는 미들웨어를 실행하겠다.
app.use('/topic', topicRouter);
app.use('/auth', authRouter);



app.use(function(req,res,next){
  res.status(404).send('sorry cont find that!')
})

app.use(function(err,req,res,next){
  console.error(err.stack)
  res.status(500).send('something broke!')
});

app.listen(3000, ()=>console.log('Example app listening on port 3000!'));



























/*
var http = require('http')
var fs = require('fs');
var url = require('url');
var qs = require('querystring')
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html')
// var template = {
//   HTML:function (title, list, body, control){
//     return `
//     <!doctype html>
//     <html>
//     <head>
//       <title>WEB1 - ${title}</title>
//       <meta charset="utf-8">
//     </head>
//     <body>
//       <h1><a href="/">WEB</a></h1>
//       ${list}
//       ${control}
//       ${body}
//     </body>
//     </html>        
//     `;
//   },
//   List:function (filelist){
//     var list = '<ul>'
//     var i =0;
//     while(i < filelist.length){
//       list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
//       i++;
//     }
//     list = list + `</ul>`
//     return list;
  
//   }
// }

// function templateHTML(title, list, body, control){
//   return `
//   <!doctype html>
//   <html>
//   <head>
//     <title>WEB1 - ${title}</title>
//     <meta charset="utf-8">
//   </head>
//   <body>
//     <h1><a href="/">WEB</a></h1>
//     ${list}
//     ${control}
//     ${body}
//   </body>
//   </html>        
//   `;
// }
// function templateList(filelist){
//   var list = '<ul>'
//   var i =0;
//   while(i < filelist.length){
//     list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
//     i++;
//   }
//   list = list + `</ul>`
//   return list;

// }


var app = http.createServer(function(request, response){
    var _url = request.url; //_url은 query data가 들어오는 변수
    var queryData = url.parse(_url, true).query; //queryData 는 url의 querydata를 객체로 반환
    var pathname = url.parse(_url, true).pathname;
    
    
    if (pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('data', function(error, filelist){
          var title = 'welcome';
          var description = 'Hello, Node.js';
          var list = template.List(filelist);
          var html = template.HTML(title,list, body=`<h2>${title}</h2>${description}`, control=`<a href="/create">create</a>`);
          // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
          response.writeHead(200);
          response.end(html);
        })
      }else {
        fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err,data){
            var title = queryData.id;
            var list = template.List(filelist);
            var description = data;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description)
            var html = template.HTML(sanitizedTitle,list, 
            body=`<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            control=`<a href="/create">create</a> 
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`);
            // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
            response.writeHead(200);
            response.end(html);
      });
    });
    };
    }else if(pathname==="/create"){
      fs.readdir('data', function(error, filelist){
        var title = 'WEB - create'; 
        var list = template.List(filelist);
        var html = template.HTML(title,list, 
          `<form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
           </form>`,'');
        // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
        response.writeHead(200);
        response.end(html);
      })
    }else if(pathname==="/create_process"){
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

    } else if(pathname==="/update"){
      fs.readdir('data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err,data){
          var title = queryData.id;
          var list = template.List(filelist);
          var description = data;
          var html = template.HTML(title,list, 
          `<form action="/update_process" method="post">
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
          control=`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          // response.end(fs.readFileSync(__dirname+_url)); //사용자에게 전송하는 데이터(프로그래밍 적으로 사용자에게 전송할 데이터를 생성함.)
          response.writeHead(200);
          response.end(html);
      });
    });
    
    }else if(pathname ==="/update_process"){
      var body=''
      request.on('data', function(data){
        body+=data;
      });
      request.on('end',function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(error){
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })

        })
      });
    }else if(pathname ==="/delete_process"){
      var body=''
      request.on('data', function(data){
        body+=data;
      });
      request.on('end',function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error){
          response.writeHead(302, {Location: `/`});
          response.end();
        })
      });
    }else {
      response.writeHead(404);
      response.end('Not found');
    }
    
});
app.listen(3000);

*/