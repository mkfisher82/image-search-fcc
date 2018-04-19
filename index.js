const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const SearchModel = require('./searchModel');

app.use(express.static(path.join(__dirname, 'public')));

// Remove keys to env variables
const apiKey = 'AIzaSyCZ2q5xJkhzTW-bgpemzjsR15fEnhmTsig';
const searchEngineID = '003425296414371488463:eritysuyba4';
const dbUser = 'mkfisher82';
const dbPassword = 'nra4ever';

const baseUrl = 'https://www.googleapis.com/customsearch/v1?';

// Connecct to db
mongoose.connect(`mongodb://${dbUser}:${dbPassword}@ds151259.mlab.com:51259/fcc-image`);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'landing.html')));

// Show previous searches
app.get('/api/latestsearches', (req, res) => {
  SearchModel.find({})
    .limit(10)
    .select('searchTerm date -_id')
    .sort({ date: 'desc' })
    .exec((err, results) => {
      if (err) {
        res.send(`There was a problem retrieving the latest searches from the database: ${err}`);
      }

      res.send(results);
    });
});

// Show search results
app.get('/api/imagesearch/:searchTerm', async (req, res) => {
  const searchTerm = req.params.searchTerm;
  let offset = req.query.offset;

  if (!offset) {
    offset = 1;
  }

  const url = `${baseUrl}q=${searchTerm}&cx=${searchEngineID}&searchType=image&start=${offset}&key=${apiKey}`;

  const search = new SearchModel({
    searchTerm,
    date: new Date(),
  });

  // save search to db
  search.save((err) => {
    if (err) {
      console.error(err);
    }
  });

  const searchResults = await axios
    .get(url)
    .then((response) => {
      const results = [];

      for (let i = 0; i < response.data.items.length; i++) {
        const result = {
          title: response.data.items[i].title,
          websiteUrl: response.data.items[i].image.contextLink,
          snippet: response.data.items[i].snippet,
          imageUrl: response.data.items[i].link,
        };

        results.push(result);
      }

      return results;
    })

    // response.data)
    .catch((error) => {
      console.log(error);
    });

  res.send(searchResults);
});

app.listen(3000);
