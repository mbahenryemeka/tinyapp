const {getUserByEmail, generateRandomString} = require('./helpers');
const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const PORT = 8080; //  default port 8080

//  configurations
app.set("view engine", "ejs");

//  middlewares
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key'],

  // Cookie Options
  maxAge: 4 * 7 * 24 * 60 * 60 * 1000 // 1 month
}));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//  create user object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",10),
  },
};




//  GET route for registration to render the register.ejs template.
app.get('/register', (req, res)=> {
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = {
    user: user
  };

  if (user) {
    return res.redirect('/urls');

  }

  res.render('register', templateVars);
});


//  POST route to submit registration form
app.post('/register', (req, res)=>{
  const email = req.body.email;
  const password = req.body.password;
  //  email and password must be provided
  if (!email || !password) {
    return res.status(400).send('you must provide an email and a password');
  }
  let foundUser = getUserByEmail(email, users);

  if (foundUser) {
    return res.status(400).send('that email is already in use');
  }
  //  happy path
  const id = generateRandomString();

  const newUser = {
    id: id,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };

  //  add newUser to the users
  users[id] = newUser;
  req.session.user_id = id;
  res.redirect('/urls');
});

//  GET route for login
app.get('/login', (req, res)=>{
  //  check if user is logged in
  const userId = req.session.userId;
  const user = users[userId];
  
  const templateVars = {
    user: user
  };

  if (user) {
    return res.redirect('/urls');
  }

  res.render('login', templateVars);
});

//  GET route to render the urls_new.ejs template.
app.get('/urls/new', (req, res) =>{
  const user = req.session.user_id;
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

// GET route to render the urls_index.ejs template.
app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const myURLs = {};
  const user = users[userId];
  if (user) {
    for (const id in urlDatabase) {
      const urlObj = urlDatabase[id];
      if (user.id === urlObj.userID) {
        myURLs[id] = urlObj;
      }
    }
  }
  
  const templateVars = {
    urls: myURLs,
    user: user
  };
  res.render('urls_index', templateVars);
});



// GET route to render urlDatabase in json format.
app.get('/urls.json', (req, res) =>{
  res.json(urlDatabase);
});

// GET route to render the html format to the browser.
app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//  GET route that receives a POST request to /urls it responds with a redirection to /urls/:id.
app.get('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  // if user is not logged in,redirect to login
  if (!user) {
    return res.status(403).send("Login to edit URLs. <a href='/login'>Login</a>");
  }

  const id = req.params.id;
  // if id (short url) not exists, send 404
  if (!(id in urlDatabase)) {
    return res.status(404).send("URL not found. <a href='/urls'>back</a>");
  }
  console.log(userId);
  
  const urlInfo = urlDatabase[id];
  console.log(urlInfo);
  // if user does not own this url, send 403
  if (urlInfo.userID !== userId) {
    return res.status(403).send("You do not own this url. <a href='/urls'>back</a>");
  }
  const longURL = urlInfo.longURL
  if (longURL) {
    const templateVars = {id: id, longURL: urlDatabase[id].longURL, user};
    res.render('urls_show', templateVars);
  } else {
    res.status(404).send('This short URL does not exist.');
  }
});

//  GET route for shareable short url.
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send('this shorten url does not exist.');
  }
  const longURL = url.longURL;
  const targetURL = longURL.startsWith('http') ? longURL : `http://${longURL}`;
  res.redirect(targetURL);
});

//  GET route for the root path to send greetings to the browser.
app.get("/", (req, res) => {
  console.log(req.session);
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect('/urls');
  } else {
    return res.redirect('/login');
  }
});

//  POST route to handle the form submission.
app.post('/urls', (req, res) =>{
  const userId = req.session.user_id;
  const user = users[userId];
  // if user is not logged in,redirect to login
  if (!user) {
    return res.status(403).send("Login to edit URLs. <a href='/login'>Login</a>");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  //const user = users[req.cookies['user_id']];
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id
  };
  res.redirect(`/urls/${shortURL}`);
});


app.post('/login',(req, res) =>{
  // get the email and the password from req.body
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('email and password needed');
  }

  let foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    return res.status(404).send('user not found');
  }
  const plainTextPasswordFromForm = password;
  const hashedPasswordFromDatabase = foundUser.password;
  //  check the password when user found.
  if (!bcrypt.compareSync(plainTextPasswordFromForm, hashedPasswordFromDatabase)) {
    return res.status(401).send('Wrong password');
  }
  req.session.user_id = foundUser.id;
  //  redirect to the urls page using res.redirect
  res.redirect('/urls');
});

//  Handles logout and clears the cookie
app.post('/logout', (req, res)=> {
  req.session = null;
  res.redirect('/urls');
});

// POST route to edit URL
app.post('/urls/:id', (req, res) =>{
  const userId = req.session.user_id;
  const user = users[userId];
  // if user is not logged in,redirect to login
  if (!user) {
    return res.status(403).send("Login to edit URLs. <a href='/login'>Login</a>");
  }

  const id = req.params.id;
  // if id (short url) not exists, send 404
  if (!(id in urlDatabase)) {
    return res.status(404).send("URL not found. <a href='/urls'>back</a>");
  }
  console.log(userId);
  
  const urlInfo = urlDatabase[id];
  console.log(urlInfo);
  // if user does not own this url, send 403
  if (urlInfo.userID !== userId) {
    return res.status(403).send("You do not own this url. <a href='/urls'>back</a>");
  }
  const longURL = req.body.longURL;
  
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
  
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  // if user is not logged in,redirect to login
  if (!user) {
    return res.status(403).send("Login to delete URLs. <a href='/login'>Login</a>");
  }

  const id = req.params.id;
  // if id (short url) not exists, send 404
  if (!(id in urlDatabase)) {
    return res.status(404).send("URL not found. <a href='/urls'>back</a>");
  }

  const urlInfo = urlDatabase[id];
  // if user does not own this url, send 403
  if (urlInfo.userID !== userId) {
    return res.status(403).send("You do not own this url. <a href='/urls'>back</a>");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});