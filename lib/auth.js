module.exports={
  isOwner:function(request, response){
    if(request.user){ //로그인 되어있다면 user 객체가 있고 안되어잇다면 user객체가 없을 것
      return true;
    }else{
      return false;
    }
  },
  statusUI:function(request, response){
    var authStatusUI = `<a href="/auth/login">login</a> | <a href="auth/register">register</a>`
    if(this.isOwner(request,response)){
      authStatusUI = `${request.user.displayName}|<a href="/auth/logout">logout</a>`
    }
    return authStatusUI
  }
}
