var express=require('express')
var parseurl = require('parseurl')
var session = require('express-session')
var FileStore = require('session-file-store')(session)

var app = express()

//자동으로 미들웨어가 내부적으로 request에 session 객체를 추가해줌
app.use(session({
  secret: 'keyboard cat',  //꼭 넣어주어야함
  resave:false, //세션데이터가 바뀌기전까지 저장소에 저장안함.
  saveUninitialized:true, //세션이 필요하기 전까지는 구동시키지 않는다.
  store:new FileStore() //이것을 file이 아닌 mysql로 바꾸면 mysql을 세션 스토어로 사용하는것.
}))


app.get('/', function(req,res,next){
  console.log(req.session);
  if(req.session.num===undefined){
    req.session.num=1;
  }else{
    req.session.num = req.session.num +1;
  }
  res.send(`views: ${req.session.num}`);  //휘발되는 메모리에 저장, 서버가 꺼졌다 켜지면 사라짐
})

app.listen(3000,function(){
  console.log('3000!')
})