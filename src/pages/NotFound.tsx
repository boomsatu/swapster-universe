
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 flex items-center justify-center">
        <div className="container max-w-3xl text-center animate-fade-in">
          <h1 className="text-7xl font-bold mb-6">404</h1>
          <p className="text-2xl mb-8 text-muted-foreground">
            Oops! We couldn't find the page you're looking for.
          </p>
          <div className="relative bg-muted/30 p-8 rounded-lg mb-8">
            <div className="absolute inset-0 z-0 overflow-hidden rounded-lg">
              <div className="absolute top-0 left-0 w-full h-full bg-primary/5 rounded-full filter blur-3xl opacity-70" />
            </div>
            <div className="relative z-10">
              <p className="text-muted-foreground mb-4">
                The page at <span className="font-mono bg-muted px-2 py-1 rounded">{location.pathname}</span> doesn't exist.
              </p>
              <p className="text-muted-foreground">
                Check the URL or return to the home page.
              </p>
            </div>
          </div>
          <Button asChild size="lg">
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
