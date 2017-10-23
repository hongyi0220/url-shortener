const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const url = process.env.MONGOLAB_URI;

app.use(express.static('public')); // Serve css and img files
app.get('/', (req, res) => { // Serve home page
  res.sendFile(__dirname + '/views/index.html');
});
// Find valid url
app.get('/http[s]?://[w]?[w]?[w]?\.?[a-zA-Z0-9]+\.[a-z]+', (req, res) => {
  const formattedURL = req.url.slice(1);
  const randomNumber = Math.floor(Math.random() * 10000);
  mongo.connect(url, (err, db) => { // Insert that url and a number into database
    if (err) throw err;
    db.collection('urls').insert({original_url: formattedURL, short_url: randomNumber});
    db.close();
  });
  res.send({"original_url": formattedURL, "short_url": 'https://micro-url.glitch.me/' + randomNumber});
});
app.get('/[a-zA-Z0-9./:]+', (req, res) => {
  res.send('Invalid url');
})
// When getting a number as param, look for the origin url in doc with the number, redirect client to that url
app.get('/[0-9]+', (req, res) => {
  const number = req.url.slice(1);

  mongo.connect(url, (err, db) => {
    if (err) throw err;
    let collection = db.collection('urls').find({'short_url': +number}).toArray((err, docs) => {
      if (err) throw err;
      let redirURL = docs[0]['original_url'];
      res.redirect(redirURL);
      db.close();
    });
  });
});

app.listen(process.env.PORT);