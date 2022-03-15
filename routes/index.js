const express = require('express');
const router = express.Router();
const template = require('../lib/template');

router.get('/', (req, res) => { // 홈
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
        `<a href = '/topic/create'>create</a>`
    );

    res.send(html);
    // })
});

module.exports = router;