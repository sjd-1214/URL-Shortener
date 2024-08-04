require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const urlparser = require("url");
const dns = require("dns");
const URL = require("./models/url");
// Basic Configuration
const port = process.env.PORT || 3000;

// connecting to db
mongoose.connect("mongodb://localhost:27017/urlShortener");
let db = mongoose.connection;

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  let dnsLookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else if (err) {
      res.json({ error: 'dns url', error_desc: err.message });
    } else {
      // check if the url exists in database
      let existingUrl = await URL.findOne({ original_url: url });
      if (existingUrl) {
        return res.json({
          original_url: existingUrl.original_url,
          short_url: existingUrl.short_url
        });
      } else {
        // creating new Url
        let count = await URL.countDocuments({});
        let newUrl = await new URL({
          original_url: url,
          short_url: count + 1
        })
        // saving new URL 
        let savedUrl = await newUrl.save();
        return res.json({
          original_url: savedUrl.original_url,
          short_url: savedUrl.short_url
        })
      }
    }
  })
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  let paramsUrl = req.params.short_url;
  // finding in the database
  let url = await URL.findOne({ short_url: paramsUrl });
  if (url) {
    res.redirect(url.original_url);
  } else {
    res.json({ error: 'No Url for this short Url' });
  }
})
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
