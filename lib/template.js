module.exports = {
  HTML:function (title, list, body, control, authStatusUI=`<a href="/auth/login">login</a> | <a href="auth/register">register</a>`){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB2 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      ${authStatusUI}
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>        
    `;
  },
  List:function (filelist){
    var list = '<ul>'
    var i =0;
    while(i < filelist.length){
      list = list + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`
      i++;
    }
    list = list + `</ul>`
    return list;
  
  }
}

