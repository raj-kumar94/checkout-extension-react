# Post-purchase checkout extension

Checkout extensions allow developers to extend and customize Shopify's checkout.

With a post-purchase extension, you can customize the experience that customers go through after completing a checkout.
For example, you can cross-sell other products, request a product review based on a previous purchase, and much more.

## Getting started

The code in this folder was created automatically to give you a starting point.

Post-purchase extensions are not yet available to the general partner community.
When they become available, you will have documentation and tutorials to guide you through the development process.
Until then, you can jump right into the code in the `./src` folder.

## Additional resources

Here are a few additional resources you might find helpful:

 - [Shopify Partners blog](https://www.shopify.com/partners/blog)
 - [Shopify Developers portal](https://shopify.dev)


# Installation:

```
shopify extension create
cd checkout-extension-react
shopify extension serve
shopify extension serve
node -v
nvm use v14.15.0
shopify extension serve
npm install @shopify/checkout-ui-extensions-run
shopify extension serve
shopify extension push
shopify extension connect
shopify extension push
```

## Serve extension
```
shopify extension serve
```

## Run the express server to get the offers and sign changes
```
nodemon app.js
```

And start ngrok tunnel as well


## Get lineItems from `inputData`