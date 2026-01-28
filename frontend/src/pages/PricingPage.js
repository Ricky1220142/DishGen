import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import BottomNav from '../components/BottomNav';
import axios from 'axios';
import { 
  Check, ChefHat, Sparkles, Crown, ArrowLeft, 
  Infinity, BookmarkIcon, Share2, Loader2 
} from 'lucide-react';
import { useState } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PricingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.plan === 'unlimited') {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/payments/checkout`, {
        origin_url: window.location.origin
      });
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.response?.data?.detail || 'Errore nel checkout. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { text: 'Tutte le categorie (salato, dolce, veloce)', included: true },
    { text: 'Istruzioni dettagliate', included: true },
    { text: 'Sostituzioni ingredienti', included: true },
    { text: 'Salva ricette illimitate', included: true },
    { text: 'Condividi ricette', included: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-heading font-semibold">Smart Cooking</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Piani e Prezzi
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Inizia gratis e passa a Unlimited quando vuoi per ricette illimitate
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Piano Gratuito</CardTitle>
              <CardDescription className="font-body">Per iniziare</CardDescription>
              <div className="mt-4">
                <span className="font-heading text-4xl font-bold">€0</span>
                <span className="text-muted-foreground font-body">/mese</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2 font-body">
                  <Check className="w-5 h-5 text-secondary" />
                  <span>50 ricette al mese</span>
                </li>
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 font-body">
                    <Check className="w-5 h-5 text-secondary" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <Link to={user ? "/generate" : "/auth"}>
                <Button 
                  variant="outline" 
                  data-testid="free-plan-btn"
                  className="w-full rounded-xl h-12 font-body font-semibold mt-4"
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Inizia a Cucinare
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Unlimited Plan */}
          <Card className="relative border-primary border-2 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-body font-semibold">
                Più popolare
              </span>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="font-heading text-xl flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" />
                Unlimited
              </CardTitle>
              <CardDescription className="font-body">Per chef seri</CardDescription>
              <div className="mt-4">
                <span className="font-heading text-4xl font-bold">€2,99</span>
                <span className="text-muted-foreground font-body">/mese</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2 font-body font-semibold text-primary">
                  <Infinity className="w-5 h-5" />
                  <span>Ricette illimitate</span>
                </li>
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 font-body">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{feature.text}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 font-body">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Supporto prioritario</span>
                </li>
              </ul>
              
              <Button 
                onClick={handleSubscribe}
                disabled={loading || user?.plan === 'unlimited'}
                data-testid="unlimited-plan-btn"
                className="w-full rounded-xl h-12 font-body font-semibold mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Caricamento...
                  </>
                ) : user?.plan === 'unlimited' ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Piano Attivo
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Abbonati
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            Perché scegliere Unlimited?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Infinity,
                title: "Ricette Illimitate",
                description: "Genera quante ricette vuoi, senza limiti mensili"
              },
              {
                icon: BookmarkIcon,
                title: "Salva Tutto",
                description: "Salva tutte le tue ricette preferite nel tuo profilo"
              },
              {
                icon: Share2,
                title: "Condividi",
                description: "Condividi le ricette con amici e familiari"
              }
            ].map((benefit, i) => (
              <Card key={i} className="text-center p-6">
                <benefit.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                <h3 className="font-heading font-semibold mb-2">{benefit.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {user && <BottomNav />}
    </div>
  );
};

export default PricingPage;
