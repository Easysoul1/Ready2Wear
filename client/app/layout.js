import "./globals.css";

export const metadata = {
  title: "FashionFlow",
  description: "Nigeria's Fashion Supply Chain Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
