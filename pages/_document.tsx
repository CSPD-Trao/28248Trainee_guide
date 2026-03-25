import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* LiquidZulu Global Styles */}
        <link rel="stylesheet" href="/styles/global.css" />
        {/* Google Fonts for LiquidZulu */}
        <link href="https://fonts.googleapis.com/css2?family=Oswald&family=Phudu&family=Bebas+Neue&display=swap" rel="stylesheet" />
        {/* Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
      </Head>
      <body>
        <a href="#main" className="skip-to-content">
          Skip to content
        </a>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
