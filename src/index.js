import {useEffect, useState} from 'react';
import { extend, render, useExtensionInput, BlockStack, Button, CalloutBanner, Heading, Image, InlineStack, Text, TextContainer, Separator, Tiles, TextBlock, Layout } from '@shopify/post-purchase-ui-extensions-react';
const discountAmount = 20;

/**
 * Get line items from inputData
 * inputData.initialPurchase.lineItems
 */
extend('Checkout::PostPurchase::ShouldRender', async ({storage, inputData}) => {
  // const postPurchaseOffer = await fetch('/cart.json').then(res => res.json());
  const postPurchaseOffer = {}
  await storage.update(postPurchaseOffer);

  console.log({inputData})
  // const {inputData} = useExtensionInput();

  setTimeout(() => {
    console.log({initialData: storage.initialData, postPurchaseOffer});
  }, 2500);

  return { render : true };
});


async function getRenderData() {
    const postPurchaseOffer = await fetch('https://gypsy.ngrok.io/get-offer').then(res => res.json());
    console.log({postPurchaseOffer})
    // await storage.update(postPurchaseOffer);
    return postPurchaseOffer
}


render('Checkout::PostPurchase::Render', () => <App />);

export function App() {
  const {done, storage, calculateChangeset, applyChangeset, inputData} = useExtensionInput();
  const {variantId, productTitle, productImageURL, productDescription, discountedPrice, originalPrice} = storage.initialData;
  console.log("storage.initialData");
  console.log(storage.initialData);
  console.log({inputData});
  const [state, setState] = useState(null);

  const [shipping, setShipping] = useState(null);
  const [taxes, setTaxes] = useState(null);
  const [total, setTotal] = useState(null);
  const [testData, setTestData] = useState(null);

  const changes = [{
      type: 'add_variant', 
      variantId, 
      quantity: 1,
      discount: {
        value: discountAmount,
        valueType: 'fixed_amount',
        title: 'Discount'
      }
    }];


  useEffect(() => {
    async function updatePriceBreakdown(){
      // Request shopify to calculate shipping costs and taxes for the upsell
      const result = await calculateChangeset({changes});

      // Extract values from response
      const shipping = result.calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount;
      const taxes = result.calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;

      // Update state variables
      setShipping(shipping);
      setTaxes(taxes);
      setTotal(`${Number(discountedPrice) + (Number(shipping) || 0) + (Number(taxes) || 0) - discountAmount}`);
    }

    updatePriceBreakdown();
  }, []);

  useEffect(() => {
    async function simulateAPICall(){
      console.log("simulateAPICall:start");
      const postPurchaseOffer = await getRenderData();
      setTestData(postPurchaseOffer);
    }
    simulateAPICall();
  }, []);


  function acceptOffer(){
    async function doAcceptOrder(){
      // Make a request to your app server to sign the changeset
      const jwtToken = await fetch(
        'https://gypsy.ngrok.io/sign-changeset', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            referenceId: inputData.initialPurchase.referenceId,
            changes: changes,
            token: inputData.token,
          }),
        })
        .then(response => response.json())
        .then(response => response.token);

      // Make a request to Shopify servers to apply the changeset
      await applyChangeset(jwtToken);
      done();
    }

    // Set state to update the UI, then call the async function
    console.log('ACCEPTING...')
    setState('ACCEPTING');
    doAcceptOrder();
  }


  function declineOffer(){
    console.log('DECLINING...');
    setState('DECLINING');
    done();
  }


  return (
    <BlockStack spacing="loose">
      <CalloutBanner title="This is a demo" >
        <Text size="medium">Add the {productTitle} to your order and </Text>
        <Text size="medium" emphasized>save 20%.</Text>
      </CalloutBanner>
      <Layout
        media={[
          {viewportSize: 'small', sizes: [1, 0, 1], maxInlineSize: 0.9},
          {viewportSize: 'medium', sizes: [532, 0, 1], maxInlineSize: 420},
          {viewportSize: 'large', sizes: [560, 38, 340]},
        ]}
      >
        <Image description="product photo" source={productImageURL} />
        <BlockStack />
        <BlockStack>
          <Heading>{productTitle}</Heading>
          <PriceHeader discountedPrice={discountedPrice} originalPrice={originalPrice} />
          <ProductDescription textLines={productDescription}/>
          <PriceBreakdown discountedPrice={discountedPrice} shipping={shipping} taxes={taxes} total={total} />
          <Buttons state={state} total={total} onAcceptPressed={acceptOffer} onDeclinePressed={declineOffer} />
            <Text>
            {JSON.stringify(testData, null, 4)}
            </Text>
        </BlockStack>
      </Layout>
    </BlockStack>
  )
}


function PriceHeader({discountedPrice, originalPrice}) {
  return (
  <InlineStack alignment="baseline" spacing="loose">
      <TextContainer alignment="trailing" spacing="loose">
        <Text role="deletion" size="large">{originalPrice}</Text>
        <Text emphasized size="large"> ${discountedPrice} CAD</Text>
      </TextContainer>
  </InlineStack>
  );
}

function ProductDescription({textLines}){
  return (
    <BlockStack spacing="xtight">
      {
        textLines.map((text, index) => <TextBlock key={index} subdued>{text}</TextBlock>)
      }
    </BlockStack>
  );
}

function PriceBreakdown({discountedPrice, shipping, taxes, total}) {
  if (!total) {
    return <></>;
  } else {
    return (
      <BlockStack spacing="tight">
        <Separator />
        <PriceBreakdownLine label="Subtotal" amount={discountedPrice}/>
        <PriceBreakdownLine label="Shipping" amount={shipping ?? 'Free'}/>
        <PriceBreakdownLine label="Taxes" amount={taxes ?? 'Free'}/>
        <PriceBreakdownLine label="Discount" amount={discountAmount}/>
        <Separator />
        <PriceBreakdownLine label="Total" amount={`$${total}`} textSize="medium"/>
      </BlockStack>
    );
  }
}

function PriceBreakdownLine({label, amount, textSize="small"}) {
  return (
    <Tiles>
      <TextBlock size="small">{label}</TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size={textSize}>{amount}</TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function Buttons({state, total, onAcceptPressed, onDeclinePressed}) {
  return (
    <BlockStack>
      <Button onPress={onAcceptPressed} submit disabled={!total || state !== null} loading={!total || state === 'ACCEPTING'}>
        Pay now · ${total}
      </Button>
      <Button onPress={onDeclinePressed} subdued disabled={state !== null} loading={state === 'DECLINING'} >
        Decline this offer
      </Button>
    </BlockStack>
  );
}
