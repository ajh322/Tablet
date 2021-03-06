var express = require('express'); // 웹서버 사용 .
var app = express();
var fs = require('fs'); // 파일 로드 사용.
var http = require('http');
var server = http.createServer(app);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
async = require("async");
mongoose.connect('mongodb://52.78.68.136:27017/test');
var conn = mongoose.connection;
var User = require('./models/like'); //모듈화 해놓은 like스키마 불러오기
var Page_data = require('./models/page_data');
var Item_data = require('./models/item_data');
var Page_count = require('./models/page_count');
var Item_count = require('./models/item_count');
var multer = require('multer');
var path = require('path')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
// 포트 설정
app.listen(80, function () {
console.log('Server Start http://localhost/test.html');
console.log('DB에 들어가고 싶다면 ./mongo를 이용');
});


// 라우팅 설정
app.get('/test.html', function (req, res) { // 웹서버 기본주소로 접속 할 경우 실행 . ( 현재 설정은 localhost 에 3303 port 사용 : 127.0.0.1:3303 )
fs.readFile('test.html', function (error, data) { // index.html 파일 로드 .
if (error) {
console.log(error);
} else {
res.writeHead(200, { 'Content-Type': 'text/html' }); // Head Type 설정 .
res.end(data); // 로드 html response .
}
});
});
app.get('/today.html', function (req, res) { // 웹서버 기본주소로 접속 할 경우 실행 . ( 현재 설정은 localhost 에 3303 port 사용 : 127.0.0.1:3303 )
fs.readFile('today.html', function (error, data) { // index.html 파일 로드 .
if (error) {
console.log(error);
} else {
res.writeHead(200, { 'Content-Type': 'text/html' }); // Head Type 설정 .
res.end(data); // 로드 html response .
}
});
});
app.get('/best.html', function (req, res) { // 웹서버 기본주소로 접속 할 경우 실행 . ( 현재 설정은 localhost 에 3303 port 사용 : 127.0.0.1:3303 )
fs.readFile('best.html', function (error, data) { // index.html 파일 로드 .
if (error) {
console.log(error);
} else {
res.writeHead(200, { 'Content-Type': 'text/html' }); // Head Type 설정 .
res.end(data); // 로드 html response .
}
});
});

app.get('/admin.html', function (req, res) { // 웹서버 기본주소로 접속 할 경우 실행 . ( 현재 설정은 localhost 에 3303 port 사용 : 127.0.0.1:3303 )
fs.readFile('admin.html', function (error, data) { // index.html 파일 로드 .
if (error) {
console.log(error);
} else {
res.writeHead(200, { 'Content-Type': 'text/html' }); // Head Type 설정 .
res.end(data); // 로드 html response .
}
});
});
app.use(express.static(__dirname + '/public'));
var storage_main = multer.diskStorage({
  destination: './public/img/main_img',
  filename: function (req, file, cb) {
       cb(null, Date.now() + path.extname(file.originalname))
  }
})

var upload_main = multer({ storage: storage_main })

app.use(express.static(__dirname + '/public'));
var storage_today = multer.diskStorage({
  destination: './public/img/item_img',
  filename: function (req, file, cb) {
       cb(null, Date.now() + path.extname(file.originalname))
  }
})

var upload_today = multer({ storage: storage_today })
/* Ajax call */
//페이지 생성
app.post('/make_page', upload_main.single('uploadFile'), function(req,res){
      //console.log(req.body); //form fields
      //console.log(req.file); //form files
      //path.extname(req.file)
      var testable,todayable,bestable;
      if(req.body.testable=="on")
        testable = true;
      else
        testable = false;
      if(req.body.todayable=="on")
        todayable = true;
      else
        todayable = false;
      if(req.body.bestable=="on")
        bestable = true;
      else
        bestable = false;
      Page_data.find({todayable:"true"}).exec(function (err,doc){
        if(todayable==true)
        {
          for(var i=0;i<doc.length;i++){
            console.log(doc[i]);
            doc[i].todayable="false";
            doc[i].save();
          }
        }
      })
      var count;
      Page_count.find().lean().exec(function (err,doc){
      //console.log(doc[0].value)
      count=doc[0].value;
      //console.log("page_index:"+count+"page_info:"+req.body.page_info+"item_name:"+req.body.item_name+"img_dir:"+req.file.path.split('public')[1]);
      try{
             conn.collection('Page_data').insert({page_index:count,page_info:req.body.page_info,item_name:req.body.item_name,img_dir:req.file.path.split('public')[1],testable:testable,todayable:todayable,bestable:bestable});   
      conn.collection('page_count').update({value:count},{value:count+1});
      }
      catch(err){}
      res.redirect("../admin.html#/page");
      })

      
      
});

app.post('/make_item', upload_today.single('uploadFile'), function(req,res){
    //console.log(req.body);
      var count;
      Item_count.find().lean().exec(function (err,doc){
      //console.log(doc[0])
      count=doc[0].item_count;
      //console.log("page_index:"+count+"page_info:"+req.body.page_info+"item_name:"+req.body.item_name+"img_dir:"+req.file.path.split('public')[1]);
      try{
             conn.collection('Item_data').insert({item_index:count,item_name:req.body.item_name,item_price:req.body.item_price,img_dir:req.file.path.split('public')[1],like:req.body.like,item_discount:"False"});   
      conn.collection('item_count').update({item_count:count},{item_count:count+1});
      }
      catch(err){
        console.log(err)
      }
      })
      res.redirect("../admin.html#/item");
});

//페이지 삭제
app.post('/delete_page', function(req, res) {
    //console.log("get");
    //console.log(req.body.page_index);
    //페이지 하나남았을때 삭제하면 새로고침이 안됌 왜그럴까??
    Page_data.find({page_index:req.body.page_index}).exec(function (err,doc){
                        var filePath = doc[0].img_dir ; 
                        //console.log(filePath);
                        fs.unlinkSync("./public"+filePath);
                        doc[0].remove();
                        res.end();
                })
});

//제품 삭제
app.post('/delete_item', function(req, res) {
    Item_data.find({item_index:req.body.item_index}).exec(function (err,doc){
                        var filePath = doc[0].img_dir ; 
                        fs.unlinkSync("./public"+filePath);
                        doc[0].remove();
                        res.end();
                })
});

//좋아요 기능
app.post('/liked', function(req, res) {
    Item_data.find({item_name:req.body.asd}).exec(function (err,doc){
                        doc[0].like+=1;
                        doc[0].save();
                        //console.log(doc[0].like);
                        return res.end(doc[0].like+"");
                })
});


//페이지 받아오기
app.post('/get_page_data', function(req, res) {
    function find (i,documents,cb)
    {
        Item_data.find({item_name:documents[i].item_name}).exec(function (err,asd){
                documents[i]["like"]=asd[0].like;
                if(i==documents.length-1) cb();
                    
        
        })
        
    }
Page_data.find().lean().exec(function (err, documents) {
    var doc=documents;
    
async.series([
    // 1st
    function(done){
        for(var i=0;i<documents.length;i++)
    {
        find(i,doc,done);
    }
    },
    // 2nd
    function(done){
      return res.end(JSON.stringify(doc));
        done()
    }
]);


}
)});
app.post('/get_testable_page_data', function(req, res) {
    Page_data.find({testable:"true"}).lean().exec(function (err, documents){
      //console.log(documents);
      return res.end(JSON.stringify(documents));
    })
});
app.post('/get_bestable_page_data', function(req, res) {
    Page_data.find({bestable:"true"}).lean().exec(function (err, documents){
      //console.log(documents);
      return res.end(JSON.stringify(documents));
    })
});
//제품 목록 받아오기
app.post('/get_item_data', function(req, res) { 
Item_data.find().lean().exec(function (err,documents){
  //console.log(JSON.stringify(documents));
                return res.end(JSON.stringify(documents));
        })
});

//제품 목록 like 순으로 소트해서 받아오기 이미지 링크 넣어줘야함
app.post('/get_item_data_sorted_by_liked', function(req, res) {
Page_data.find({bestable:"true"}).lean().exec(function (err, documents) {
  var itemlist = [];
  //console.log(documents);
    documents.forEach(function(doc)
      {
        //console.log(doc);
        itemlist.push(doc.item_name);
      })
      console.log(itemlist);
    
        Item_data.find({item_name: { $in: itemlist}}).sort('-like').lean().exec(function (err, docs) 
        {
          for(var i=0;i<3;i++)
          {
if(i==2)
{//console.log(JSON.stringify(documents));
                //console.log(docs);
            return res.end(JSON.stringify(docs));
          }}}
                
      
            
        )

})});


//{item_name:documents[i].item_index}