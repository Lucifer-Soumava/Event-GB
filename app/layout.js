import './globals.css';

export const metadata = {
  title: 'Goynar Baksho Annual Celebration 2026 | নতুন শিল্পী, নতুন কণ্ঠ, নতুন সুর',
  description: "Official event page for Goynar Baksho Annual Celebration 2026 on 1 November 2026 at Boys' Own Library Auditorium, Hatibagan, Kolkata. Bringing together emerging artists from music, dance, recitation, and theatre.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@300;400;500;600;700&family=Cinzel:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
