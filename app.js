require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());


// Replace the following constants with real values.
const DEV_STORE = 'codecrux';
const X_SHOPIFY_ACCESS_TOKEN = 'xxxxxx';
const API_KEY = process.env.SHOPIFY_API_KEY;
const API_SECRET = process.env.SHOPIFY_API_SECRET;
const PRODUCT_ID = 6100390084767;


app.get('/get-offer', async (req, res) => {
  const apiResponse = await fetch(
    `https://${DEV_STORE}.myshopify.com/admin/api/2021-04/products/${PRODUCT_ID}.json`,
    {
      headers: {
        'X-Shopify-Access-Token' : X_SHOPIFY_ACCESS_TOKEN
      }
    }
  );
  const jsonResponse = await apiResponse.json();

  const product = jsonResponse.product;
  res.send({
    variantId: product.variants[0].id,
    productTitle: product.title,
    productImageURL: product.images[0].src,
    productDescription: product.body_html.split(/<br.*?>/),
    discountedPrice: product.variants[0].price,
    // discountedPrice: 50, // this is just for the display purpose, it won't change the actual price. Use a discount field in changes array instead
    originalPrice: product.variants[0].compare_at_price,
  });
});

app.post('/sign-changeset', (req, res) => {
  // Verify that authenticity of the request
  const decodedToken = jwt.verify(req.body.token, API_SECRET);
  const decodedReferenceId = decodedToken.input_data.initialPurchase.referenceId;
  if (decodedReferenceId !== req.body.referenceId){
    res.status(400).render();
  }

  const payload = {
    iss: API_KEY,
    jti: uuidv4(),
    iat: Date.now(),
    sub: req.body.referenceId,
    changes: req.body.changes,
  };

  const token = jwt.sign(payload, API_SECRET);
  res.json({ token });
});

app.listen(port, () => console.log(`App is listening at http://localhost:${port}`));
