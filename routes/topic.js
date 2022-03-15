const express = require('express');
const router = express.Router();
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const template = require('../lib/template');

// /topic/:pageId 밑에 있으면 topic 제어에 걸리므로 위로 올려야 함.
router.get('/create', (req, res) => {

    const title = 'WEB - create';

    let list = template.list(req.list);

    // post 방식
    const html = template.html(title, list, `
    <form action = "/topic/create_process" method="post">
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

router.post('/create_process', (req, res) => {
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
        res.redirect(`/topic/${title}`); // 익스프레스에서 page/title 로 리다이렉트
    });
});

router.get('/update/:pageId', (req, res) => {

    fs.readFile(`data/${req.params.pageId}`, 'utf8', function (err, description) {
        const title = req.params.pageId;
        let list = template.list(req.list);
        const html = template.html(title, list, // hidden으로 사용자에게는 안보이게 원래 제목 저장. f12-network-payload 확인. 
            `
        <form action = "/topic/update_process" method="post">
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
            `<a href = '/topic/create'>create</a> <a href = '/topic/update/${title}'>update</a>`
        );
        res.send(html);
    });
});

router.post('/update_process', (req, res) => {
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
            res.redirect(`/topic/${title}`); // 리다이렉션. 쓴 글 페이지로 바로 이동.
        })
    });
});

router.post('/delete_process', (req, res) => {
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

router.get('/:pageId', (req, res, next) => {
    // return res.send(req.params); // http://localhost:3000/page/html => { "pageId": "html" }

    console.log(req.list);


    fs.readFile(`data/${req.params.pageId}`, 'utf8', function (err, description) {

        if (err) {
            next(err); // 에러 있는 경우 next에 인자
        } else {
            const title = req.params.pageId;
            let list = template.list(req.list);
            const html = template.html(title, list,
                `<h2>${title}</h2>${description}`,
                `<a href = '/topic/create'>create</a>
            <a href = '/topic/update/${title}'>update</a>
            <form action="/topic/delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
            </form>`
            );
            res.send(html);
        }

    });
});
// app.get('/create', (req, res) => {

//   const title = 'WEB - create';

//   let list = template.list(req.list);

//   // post 방식
//   const html = template.html(title, list, `
//   <form action = "/create_process" method="post">
//   <!-- create_process로 정보 전송. get할때는 쿼리스트링(?title=aa), 생성, 수정, 삭제 => 보이지 않는 방식 method="post". 안쓰면 기본 get -->
//     <p><input type = "text" placeholder = "title" name = "title"></p>
//     <p>
//         <textarea placeholder = "description" name = 'description'></textarea>
//     </p>

//     <p>
//         <input type="submit">
//     </p>
//   </form>
//   `, ''); // form 입력 양식

//   res.send(html);
// });

module.exports = router;