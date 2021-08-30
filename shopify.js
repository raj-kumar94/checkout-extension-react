require('dotenv').config();
const Shopify = require('shopify-api-node');

const shopify = new Shopify({
    shopName: 'codecrux',
    accessToken: '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'
});

const getLastOrderOfCustomer = () => {
    const query = `
    {
        customer(id: "gid://shopify/Customer/5654668640415") {
            id
            firstName
            lastOrder {
                id
                name
                lineItems(first: 5) {
                edges {
                    node {
                        title
                        product {
                            id
                        }
                    }
                }
            }
          }
        }
    }      
    `;
    
    

    shopify
        .graphql(query)
        .then((customers) => console.log(customers))
        .catch((err) => console.error(err));    
}

getLastOrderOfCustomer();