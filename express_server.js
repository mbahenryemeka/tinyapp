const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require('morgan');
const PORT = 8080; // default port 8080

//  configurations
app.set("view engine", "ejs");

// middlewares 
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};



//  GET route to render the urls_new.ejs template.
app.get('/urls/new', (req, res) =>{
  const username = req.cookies['username'];
  const templateVars = { username }; 
  res.render('urls_new', templateVars);
});

// GET route to render the urls_index.ejs template.
app.get('/urls', (req, res) => {
  const username = req.cookies['username'];
  const templateVars = {urls: urlDatabase, username }; 
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
  const username = req.cookies['username'];
  const myID = req.params.id;
  const longURL = urlDatabase[myID];
  if (longURL) {
    const templateVars = {id: myID, longURL: urlDatabase[myID], username};
    res.render('urls_show', templateVars);
  } else {
    res.status(404).send('This short URL does not exist.');
  }
});

//  GET route for shareable short url.
app.get("/u/:id", (req, res) => {
  const myID = req.params.id;
  const longURL = urlDatabase[myID]
  res.redirect(longURL);
});

//  GET route for the root path to send greetings to the browser.
app.get("/", (req, res) => {
  res.send("Hello!");
});

//  POST route to handle the form submission.
app.post('/urls', (req, res) =>{
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL; 
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login',(req, res) =>{
  // get the username from req.body
  const username = req.body.username;
  // save the username to cookie using res.cookie
  res.cookie('username', username);
  // redirect to the urs page using res.redirect
  res.redirect('/urls');
})

app.post('/logout', (req, res)=> {
  res.clearCookie('username');
  res.redirect('/urls');
});

// POST route to edit URL
app.post('/urls/:id', (req, res) =>{
  const {id} = req.params;
  const longURL = req.body.longURL;
  if (urlDatabase[id]) {
     urlDatabase[id] = longURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found!');
  }
});

// POST route to delete short URL from the urlDatabase.
app.post('/urls/:id/delete', (req, res) =>{
  const {id} = req.params;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found!');
  }
});


//  Generate a random strings
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i<6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

