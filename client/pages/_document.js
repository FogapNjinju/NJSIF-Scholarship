import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#07101f" />
        <meta name="description" content="NJSIF Scholarship Fund supports students through funding, mentorship, and opportunity." />
        <link rel="icon" href="/njsif-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/njsif-mark.svg" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}