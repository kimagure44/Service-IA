const fs = require('fs');
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const visualRecognition = new VisualRecognitionV3({
  version: '2018-03-19',
  authenticator: new IamAuthenticator({
    apikey: '{apiKey}',
  }),
  url: '{ulr}',
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-COntrol-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.get("/ibm-watson", (req, res) => {
  const classifyParams = {
    imagesFile: fs.createReadStream(req.query.file),
    owners: ['IBM', 'me'],
    threshold: 0.1,
  };
  
  visualRecognition.classify(classifyParams)
    .then(response => {
      const classifiedImages = response.result;
      res.status(200).json(classifiedImages);
    })
    .catch(err => {
      res.status(400).json({ message: err });
      console.log('error:', err);
    });
});

const server = app.listen(3000, () => {
  console.log("App running on port.", server.address().port);
});


