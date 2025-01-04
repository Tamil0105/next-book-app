import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
        <Script 
         src="https://sdk.cashfree.com/js/v3/cashfree-2023.03.07.js"
        strategy="lazyOnload" // or "afterInteractive" based on your needs
      />
        {/* <script src="https://sdk.cashfree.com/js/v3/cashfree-2023.03.07.js"></script> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
