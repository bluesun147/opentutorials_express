const express = require('express');
const fs = require('fs');
const compression = require('compression');
const qs = require('querystring');
const path = require('path');
const template = require('./lib/template');

const app = express();

// 정적 파일(이미지, js, css파일 등) 사용
// 익스프레스 기본 제공 미들웨어 함수 express.static
// 정적 파일 포함된 디렉토리 명 직접 지정. public
app.use(express.static('public'));

// body parser 미들웨어
app.use(express.urlencoded({ extended: false}));

// compression 미들웨어. 압축
app.use(compression());

// 미들웨어 직접 만들어보자.
// 미들웨어는 함수 형식
app.get('*', (req, res, next) => { // use 대신 get으로 바꿈. *은 모든 요청이라는 뜻. 즉 
   // get으로 들어오는 모든 요청만 파일 목록 가져옴. post는 x
   // app.use('/user.:id' ~) 처럼 특정 경로에만 미들웨어 동작하게 할 수 있음.
  fs.readdir('./data', function(error, filelist){
    req.list = filelist;
    next(); // 그 다음 미들웨어 호출
  })
})

app.get('/', (req, res) => { // 홈
    //fs.readdir('./data', function(error, filelist){
        const title = 'Welcome home';
        const description = 'Hello, Node.js';
        
        // let list = templateList(filelist);
        // let list = template.list(filelist);
        let list = template.list(req.list);

        const html = template.html(title, list,
          `
          <h2>${title}</h2>${description}
          <img src = "/images/hello.jpg" style = "width: 300px; display: block; margin-top: 10px"/>
          `,
          `<a href = '/create'>create</a>`
          );

        res.send(html);
     // })
});

/*
Route path: /users/:userId/books/:bookId
Request URL: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }

app.get('/users/:userId/books/:bookId', (req, res) => {
  res.send(req.params);
})
*/

app.get('/page/:pageId', (req, res, next) => {
    // return res.send(req.params); // http://localhost:3000/page/html => { "pageId": "html" }

    console.log(req.list);

    
    fs.readFile(`data/${req.params.pageId}`, 'utf8', function(err, description){

      if (err) {
        next(err); // 에러 있는 경우 next에 인자
      } else {
        const title = req.params.pageId;
        let list = template.list(req.list);
        const html = template.html(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href = '/create'>create</a>
          <a href = '/update/${title}'>update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value="delete">
          </form>`
          );
        res.send(html);
      }
    
  });
});
app.get('/create', (req, res) => {
  
  const title = 'WEB - create';
  
  let list = template.list(req.list);

  // post 방식
  const html = template.html(title, list, `
  <form action = "/create_process" method="post">
  <!-- create_process로 정보 전송. get할때는 쿼리스트링(?title=aa), 생성, 수정, 삭제 => 보이지 않는 방식 method="post". 안쓰면 기본 get -->
    <p><input type = "text" placeholder = "title" name = "title"></p>
    <p>
        <textarea placeholder = "description" name = 'description'></textarea>
    </p>

    <p>
        <input type="submit">
    </p>
  </form>
  `, ''); // form 입력 양식

  res.send(html);
});

app.post('/create_process', (req, res) => {
  /*let body = '';

  req.on('data', (data) => { // 전송된 데이터 가져오기
    body += data; // 정보 조각조각 들어오다가
  });

  req.on('end', () => { // 다 들어오면
    const post = qs.parse(body); // 객체화
    const title = post.title; // 제목
    const description = post.description; // 설명
    console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }

    fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
      // res.writeHead(302, {Location: `/?id=${title}`}); // 리다이렉션. 쓴 글 페이지로 바로 이동.
      // res.end('success');
      res.redirect(`/page/${title}`); // 익스프레스에서 page/title 로 리다이렉트
    });
  });*/
  console.log(req.list);
  let post = req.body; // 리퀘스트 객체의 body 프로퍼티에 접근. 간단
  const title = post.title; // 제목
  const description = post.description; // 설명
  console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }

  fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
    // res.writeHead(302, {Location: `/?id=${title}`}); // 리다이렉션. 쓴 글 페이지로 바로 이동.
    // res.end('success');
    res.redirect(`/page/${title}`); // 익스프레스에서 page/title 로 리다이렉트
  });

});

app.get('/update/:pageId', (req, res) => {
    
    fs.readFile(`data/${req.params.pageId}`, 'utf8', function(err, description){
    const title = req.params.pageId;
    let list = template.list(req.list);
    const html = template.html(title, list, // hidden으로 사용자에게는 안보이게 원래 제목 저장. f12-network-payload 확인. 
      `
      <form action = "/update_process" method="post">
      <input type = "hidden" name = "id" value = "${title}">
      <!-- create_process로 정보 전송. get할때는 쿼리스트링(?title=aa), 생성, 수정, 삭제 => 보이지 않는 방식 method="post". 안쓰면 기본 get -->
        <p><input type = "text" placeholder = "title" name = "title" value = ${title}></p>
        <p>
            <textarea placeholder = "description" name = 'description'>${description}</textarea>
        </p>
    
        <p>
            <input type="submit">
        </p>
      </form>
      
      `,
      `<a href = '/create'>create</a> <a href = '/update?id=${title}'>update</a>`
      );
    res.send(html);
  });
});

app.post('/update_process', (req, res) => {
  /*let body = '';

  req.on('data', (data) => { // 전송된 데이터 가져오기
    body += data; // 정보 조각조각 들어오다가
  });

  req.on('end', () => { // 다 들어오면
    //const post = qs.parse(body); // 객체화
    const post = qs.parse(body); // 객체화
    const id = post.id;
    const title = post.title; // 제목
    const description = post.description; // 설명

    fs.rename(`data/${id}`, `data/${title}`, (error) => { // 파일명 변경. oldpath, newPath, callback
      // 내용 바꾸기
      fs.writeFile(`data/${title}`, description, 'utf8', () => {
        res.writeHead(302, {Location: `/?id=${title}`}); // 리다이렉션. 쓴 글 페이지로 바로 이동.
        res.send();
      })
    });

    console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }
  });*/

  let post = req.body; // 리퀘스트 객체의 body 프로퍼티에 접근. 간단
  const id = post.id;
  const title = post.title; // 제목
  const description = post.description; // 설명
  fs.rename(`data/${id}`, `data/${title}`, (error) => { // 파일명 변경. oldpath, newPath, callback
    // 내용 바꾸기
    fs.writeFile(`data/${title}`, description, 'utf8', () => {
      res.redirect(`/page/${title}`); // 리다이렉션. 쓴 글 페이지로 바로 이동.
    })
  });
});

app.post('/delete_process', (req, res) => {
  /*let body = '';

  req.on('data', (data) => { // 전송된 데이터 가져오기
    body += data; // 정보 조각조각 들어오다가
  });

  req.on('end', () => { // 다 들어오면
    const post = qs.parse(body); // 객체화
    const id = post.id;
    fs.unlink(`data/${id}`, (error) => {
      // res.writeHead(302, {Location: `/`}); // 삭제되면 바로 홈으로 리다이렉션
      // res.send();
      res.redirect('/'); // 익스프레스에서 리다이렉트
    })

    console.log(post); // [Object: null prototype] { title: 'qq', description: 'zz' }

  });*/
  const post = req.body;
  const id = post.id;
  fs.unlink(`data/${id}`, (error) => {
    // res.writeHead(302, {Location: `/`}); // 삭제되면 바로 홈으로 리다이렉션
    // res.send();
    res.redirect('/'); // 익스프레스에서 리다이렉트
  });
});

app.use((req, res, next) => {
  res.status(404).send("404 : can't find that!");
});

app.use((err, req, res, next) => { // 에러 핸들러. 인자 4개
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
    console.log('3000에서 실행!');
});