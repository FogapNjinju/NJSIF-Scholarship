import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#07101f" />
        <meta name="description" content="NJSIF Scholarship Fund supports students through funding, mentorship, and opportunity." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NJSIF" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/njsif-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/njsif-icon-180.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}