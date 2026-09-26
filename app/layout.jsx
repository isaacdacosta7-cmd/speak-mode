import './globals.css';

export const metadata = {
  title: 'Speak Mode',
  description: 'Conversational English training platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
