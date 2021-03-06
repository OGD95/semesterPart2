const { COPYFILE_FICLONE_FORCE } = require('constants');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express();

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

app.get('/math', function (req, res) {
  res.sendFile('views/pages/mathSubmission.html', { root: __dirname });
  const result = eval(req.query.operand1 + req.query.operator + req.query.operand2);
  let results = encodeURIComponent(result);
  if (result) {
    return res.redirect('results?result=' + results);
  }

})

app.get('/results', function (req, res) {
  var result = req.query.result;
  res.render('pages/results', { result: result });
})

app.get('/packageDetails', function (req, res) {
  let shippingCost = 0;
  const packageDetails = req.query;
  res.sendFile('views/pages/packageDetails.html', { root: __dirname });


  //Pricing for first-class package
  if (req.query.mailType == 'firstClassPackage-Retail') {
    if (req.query.weightOz <= 4) {
      shippingCost = 4.00;
    }
    else if (req.query.weightOz <= 8){
      shippingCost = 4.80;
    }
    else if (req.query.weightOz <= 12) {
      shippingCost = 5.50;
    }
    else {
      shippingCost = 6.25;
    }
  }
  //Pricing for Large Envelopes
  else if (req.query.weightOz > 3.5 || req.query.mailType == 'largeEnvelopeFlats') {
    shippingCost = 1.00 + ((Math.floor(req.query.weightOz) - 1) * .20);
    req.query.mailType = 'largeEnvelopeFlats'
  } else {
    //Pricing for stamped letters
    if (req.query.mailType == 'letterStamped' && req.query.weightOz <= 3.5 && req.query.weightOz > 3) {
      shippingCost = 1.15;
    }
    else if (req.query.mailType == 'letterStamped') {
      shippingCost = 0.55 + ((Math.floor(req.query.weightOz) - 1) * .20);
    }

    //Pricing for metered letters
    if (req.query.mailType == 'letterMetered' && req.query.weightOz <= 3.5 && req.query.weightOz > 3) {
      shippingCost = 1.11;
    }
    else if (req.query.mailType == 'letterMetered') {
      shippingCost = 0.51 + ((Math.floor(req.query.weightOz) - 1) * 0.20);
    }
  }

  let packageDetailsToSend = JSON.stringify(packageDetails);

  if (shippingCost) {
    return res.redirect('calculatedCost?shippingCost=' + shippingCost.toFixed(2) + '&packageDetails=' + packageDetailsToSend)
  }
})

app.get('/calculatedCost', function (req, res) {
  var packageDetails = JSON.parse(req.query.packageDetails);
  var shippingCost = req.query.shippingCost;
  res.render('pages/shippingCost', { packageDetails: packageDetails, shippingCost: shippingCost });
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
