import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import type { DocumentContext } from 'next/document';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';

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

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => (
        <StyleProvider cache={cache}>
          <App {...props} />
        </StyleProvider>
      ),
    });

  const initialProps = await Document.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  };
};

export default MyDocument;
