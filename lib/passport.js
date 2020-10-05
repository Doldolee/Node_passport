var db = require('../lib/db');


module.exports = function(app){
  //passport
  var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

  //passport를 사용하겠다, 내부적으로 session을 쓰겠다.
  app.use(passport.initialize());
  app.use(passport.session());

  //session을 처리하는 방법
  //serializeuser:로그인을 성공했을 때 딱 한번 호출되면서 성공했다라는 사실을 세션스토어에 저장하는 기능
  passport.serializeUser(function(user,done){
    // done(null, user.id);
    console.log('serializeUser', user) //authData가 옴
    done(null, user.id) //회원을 구분할 수 잇는 식별자를 인자로 줘라
  });
  //로그인 성공 후 페이지를 방문할 때마다 deserializeuser 의 콜백이 실행됨, 실제 데이터를 조회해서 가져옴(실제로는 데이터베이스에서 조회해서 가져옴)
  //저장된 데이터를 기준으로 로그인 한 사용자 인지아닌지 확인(필요한 정보 조회)
  passport.deserializeUser(function(id,done){
    var user = db.get('users').find({id:id}).value(); //db에서 데이터 가져옴
    done(null,user);
    // User.findById(id, function(err,user){
    //   done(err, user);
    // });
  });

  //사용자가 로그인을 시도할때 성공 실패를 결정하는 코드
  passport.use(new LocalStrategy(
    {
      usernameField:'email',
      passwordField:'pwd'
    },
    function(email,password,done){  //done에 따라 성공 실패를 passport에게 알려줄수잇음
      var user = db.get('users').find({email:email, password:password}).value();
      if (user){
        return done(null, user,{message:'welcome'  //serialzeuser의 콜백함수 인자로 넘겨줌
      }); 
      }else{
        return done(null, false,{
          message:'incorrect user information'
        });
      }
    }
    
  ));
  return passport; //d외부에서도 쓸 수 있게해줌
  }
