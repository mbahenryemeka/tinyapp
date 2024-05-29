const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({extended: true}));

app.get('/urls/new', (req, res) =>{
  res.render('urls_new');
})

app.get('/urls/:id', (req, res) => {
  const myID = req.params.id
  const templateVars = {id: myID, longURL: urlDatabase[myID]}
  res.render('urls_shows', templateVars);
});




app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars)
});

app.get('/urls.json', (req, res) =>{
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i<6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return;
}


app.post('/urls', (req, res) =>{
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  console.log(`Short URL: ${shortURL} is mapped to Long URL: ${longURL}`);
  //res.send("Short URL generated successfully!");
})



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});