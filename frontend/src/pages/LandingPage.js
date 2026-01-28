import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ChefHat, Sparkles, BookmarkIcon, Share2, ArrowRight, Crown } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/17637109/pexels-photo-17637109.png)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        
        <div className="relative z-10 px-4 py-12 md:py-24">
          {/* Header */}
          <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading text-xl font-semibold">Smart Cooking</span>
            </div>
            
            {user ? (
              <Link to="/generate">
                <Button data-testid="header-genera-btn" className="rounded-full font-body">
                  Genera Ricetta
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button data-testid="header-login-btn" variant="outline" className="rounded-full font-body">
                  Accedi
                </Button>
              </Link>
            )}
          </header>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-body">
              <Sparkles className="w-4 h-4" />
              Powered by AI
            </div>
            
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
              Trasforma i tuoi ingredienti in{' '}
              <span className="text-primary">ricette deliziose</span>
            </h1>
            
            <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
              Dimmi cosa hai in frigo e la nostra AI creerà ricette personalizzate 
              in pochi secondi. Facile, veloce, delizioso.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to={user ? "/generate" : "/auth"}>
                <Button 
                  data-testid="hero-start-btn"
                  size="lg" 
                  className="rounded-full px-8 py-6 text-lg font-body font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Inizia a Cucinare
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button 
                  data-testid="hero-pricing-btn"
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-lg font-body"
                >
                  Vedi Piani
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">
            Come funziona?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ChefHat,
                title: "1. Inserisci Ingredienti",
                description: "Scrivi cosa hai in cucina: pomodori, pasta, basilico... qualsiasi cosa!"
              },
              {
                icon: Sparkles,
                title: "2. AI Genera la Ricetta",
                description: "La nostra intelligenza artificiale crea una ricetta perfetta per te"
              },
              {
                icon: BookmarkIcon,
                title: "3. Salva e Condividi",
                description: "Salva le tue ricette preferite e condividile con amici e famiglia"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-card p-8 rounded-2xl border border-border/50 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="font-body text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-4">
            Categorie di Ricette
          </h2>
          <p className="font-body text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Scegli la categoria che preferisci e lascia che l'AI faccia il resto
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Piatti Salati",
                emoji: "🍝",
                description: "Primi, secondi e contorni della tradizione italiana",
                color: "bg-secondary"
              },
              {
                title: "Dolci",
                emoji: "🍰",
                description: "Dessert, torte e dolci per ogni occasione",
                color: "bg-accent"
              },
              {
                title: "Ricette Veloci",
                emoji: "⚡",
                description: "Piatti pronti in massimo 20 minuti",
                color: "bg-primary"
              }
            ].map((category, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-2xl p-6 text-white group cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ background: `linear-gradient(135deg, hsl(var(--${category.color === 'bg-primary' ? 'primary' : category.color === 'bg-secondary' ? 'secondary' : 'accent'})), hsl(var(--${category.color === 'bg-primary' ? 'primary' : category.color === 'bg-secondary' ? 'secondary' : 'accent'}) / 0.8))` }}
              >
                <span className="text-5xl mb-4 block">{category.emoji}</span>
                <h3 className="font-heading text-2xl font-bold mb-2">{category.title}</h3>
                <p className="font-body opacity-90">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Pronto a cucinare?
          </h2>
          <p className="font-body text-lg opacity-90 mb-8">
            Inizia gratis con 50 ricette al mese. Passa a Unlimited per ricette illimitate!
          </p>
          <Link to={user ? "/generate" : "/auth"}>
            <Button 
              data-testid="cta-start-btn"
              size="lg"
              variant="secondary"
              className="rounded-full px-8 py-6 text-lg font-body font-semibold bg-white text-primary hover:bg-white/90"
            >
              Inizia Gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-body text-sm text-muted-foreground">
              Smart Cooking © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/pricing" className="font-body text-sm text-muted-foreground hover:text-foreground">
              Prezzi
            </Link>
            <a 
              href="https://app.emergent.sh/?utm_source=emergent-badge" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-body text-sm text-muted-foreground hover:text-foreground"
            >
              Made with Emergent
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
