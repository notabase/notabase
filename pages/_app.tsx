import Head from 'next/head';
import Router from 'next/router';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify';
import NProgress from 'nprogress';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { ProvideAuth } from 'utils/useAuth';
import AppLayout from 'components/AppLayout';
import ServiceWorker from 'components/ServiceWorker';
import PublishLayout from 'components/PublishLayout';
import 'styles/styles.css';
import 'styles/nprogress.css';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function MyApp({ Component, pageProps, router }: AppProps) {
  let children;
  if (router.pathname.startsWith('/app')) {
    children = (
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    );
  } else if (router.pathname.startsWith('/publish')) {
    children = (
      <PublishLayout>
        <Component {...pageProps} />
      </PublishLayout>
    );
  } else {
    children = (
      <main className={`${inter.variable} font-display`}>
        <Component {...pageProps} />
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>
          Notabase | Powerful and easy-to-use note-taking app for networked
          thinking
        </title>
      </Head>
      <Script
        src="https://plausible.io/js/plausible.js"
        data-domain="notabase.io"
        onLoad={() => {
          window.plausible =
            window.plausible ||
            function () {
              // eslint-disable-next-line prefer-rest-params
              (window.plausible.q = window.plausible.q || []).push(arguments);
            };
        }}
      />
      <ServiceWorker>
        <ProvideAuth>{children}</ProvideAuth>
      </ServiceWorker>
      <ToastContainer
        position="top-center"
        hideProgressBar
        newestOnTop={true}
        theme="colored"
      />
    </>
  );
}
