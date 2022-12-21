const express = require('express')
const fs = require('fs')
const path = require('path');
const app = express()
const session = require('express-session');
const port = process.env.PORT ?? 3000;
var bodyParser = require('body-parser');

app.engine('.html', require('ejs').__express);

// Support body for post
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({extended: true})); 

// Create sessions for user logins
app.use(session({secret:'Secret Value', name: Date.now().toString(16), resave: false, saveUninitialized:false}))
app.use(function(req, res, next) {res.locals.errorMsg = {}; next();}) 

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Redirect to main page
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.redirect(`home`)
    } else {
        res.redirect(`login`);
    }

})
app.get('/login', (req, res) => {
    res.render(path.join(__dirname, `views/login.ejs`));
})
app.get('/readlist', (req, res) => {
    // get user obj
    const BookDB = JSON.parse(fs.readFileSync(`./localDB/books.json`))
    const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
    let user = Users[req.session.username]

    if (user == undefined) return res.redirect(`login`)

    let Books = {}
    for (let bookId of user.readList) {
        let bookObj = BookDB[bookId]
        if (bookObj != undefined) Books[bookId] = bookObj;
    }
    
    // render readlist page by sending object of books
    res.status(200).render(path.join(__dirname, `views/readlist.ejs`), {Books: Books})
})
// Render specific page
app.get('/:path', (req, res) => {
    // idk, hardcode to bypass an error
    if (req.params.path == 'favicon.ico') return res.end();
    // if not logged in yet, redirect to login screen
    if (!req.session.loggedin && req.params.path != 'registration') return res.redirect(`login`);

    const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`));
    let user = Users[req?.session?.username];
    res.render(path.join(__dirname, `views/${req.params.path}.ejs`), {userReadList: user?.readList});
})

app.post('/readlist/:bookid', (req, res) => {
    const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`));
    let bookId = req.params.bookid;

    // make sure user logged in
    if(req.session.username == undefined) return res.redirect(`../login`);

    if(!Users[req.session.username].readList.includes(bookId)) Users[req.session.username].readList.push(bookId);
    fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
        if (err) {
            console.log(err);
            res.status(500).end();
        } else {
            res.redirect("../home");
            //res.redirect("../" + bookId);
            //res.end();
        }
    })
});

app.post('/:path', (req, res) => {
    switch (req.params.path.toLowerCase()) {
        case "search": {
            let Books = require(`./localDB/books.json`)
            let keyword = req.body.Search;
            let result = [];

            // Server-sided; generate query to search through books database
            for (let book in Books) {
                // If book's title includes the keyword, add it to the list
                if (Books[book].title.toLowerCase().includes(keyword.toLowerCase())) {
                    result[book] = Books[book];
                }
            }
            // send query
            res.status(200).render(path.join(__dirname, `views/searchresults.ejs`), {Books: result})
            break;
        }
        case "login": {
            // TODO, make look nicer
            const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
            let {username, password} = req.body;

            // Ensure no empty field
            if (!username || !password) return res.status(200).render(path.join(__dirname, `views/login.ejs`), {errorMsg: {message:`Please enter both the username and password.`}})

            // User does not exist
            if (!Users[username]) return res.status(200).render(path.join(__dirname, `views/login.ejs`), {errorMsg: {message:`User ${username} does not exist.`}})

            if (Users[username]?.password != password) {
                return res.status(200).render(path.join(__dirname, `views/login.ejs`), {errorMsg: {message:`Incorrect password!`}})
            } else {
                // Log in
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect(`home`)
                return
            }
        }
        case "register": {
            const Users = JSON.parse(fs.readFileSync(`./localDB/users.json`))
            let {username, password} = req.body;
            
            // Ensure no empty field
            if (!username || !password) return res.status(200).render(path.join(__dirname, `views/registration.ejs`), {errorMsg: {message:`Please enter both the username and password.`}})

            // User already exists
            if (Users[username]) return res.status(200).render(path.join(__dirname, `views/registration.ejs`), {errorMsg: {message:`Username ${username} already taken!`}})

            // Add user to DB
            Users[username] = {
                password: password,
                createdOn: Date.now(),
                readList: []
            }
            fs.writeFile(`./localDB/users.json`, JSON.stringify(Users), 'utf8', (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else {
                    console.log(`Registered user: ${username}`)
                }
            })

            res.redirect(`login`)
            return
        }
        default: {
            res.status(404).send(`POST Request Called ${req.params.path}`);
            console.log(req.body.params)
        }
    }
})



app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
