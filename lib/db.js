const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')//동기식으로 저장하겠다.
const adapter = new FileSync('db.json')//db.json파일에 저장하겠다.
const db = low(adapter)//db라는 변수로 db.json에 저장된 정보를 동기식으로 처리가능하다.
db.defaults({users:[]}).write();//users라는 곳에 저장하겠다.

module.exports = db;