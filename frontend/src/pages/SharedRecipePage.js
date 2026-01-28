import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import axios from 'axios';
import { 
  Clock, Users, Lightbulb, ChefHat, 
  ArrowLeft, Loader2, AlertCircle, Share2 
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SharedRecipePage = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`${API}/recipes/shared/${recipeId}`);
      setRecipe(response.data);
    } catch (err) {
      setError('Ricetta non trovata');
    } finally {
      setLoading(false);
    }
  };

  const shareRecipe = async () => {
    const shareUrl = window.location.href;
    const shareText = `🍳 ${recipe.title}\n\nGenerata con Smart Cooking AI\n${shareUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copiato negli appunti!');
    }
  };

  const categoryColors = {
    salato: 'bg-secondary text-secondary-foreground',
    dolce: 'bg-accent text-accent-foreground',
    veloce: 'bg-primary text-primary-foreground'
  };

  const categoryEmojis = {
    salato: '🍝',
    dolce: '🍰',
    veloce: '⚡'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h1 className="font-heading text-2xl font-bold mb-2">{error}</h1>
            <p className="font-body text-muted-foreground mb-6">
              La ricetta che stai cercando non esiste o è stata rimossa.
            </p>
            <Link to="/">
              <Button className="rounded-full font-body">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-heading font-semibold">Smart Cooking</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card className="overflow-hidden" data-testid="shared-recipe">
          {/* Hero */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
            <Badge className={`mb-3 ${categoryColors[recipe.category]}`}>
              {categoryEmojis[recipe.category]} {recipe.category}
            </Badge>
            <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
              {recipe.title}
            </h1>
            <p className="font-body opacity-90">{recipe.description}</p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-body">Prep: {recipe.prep_time}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-body">Cottura: {recipe.cook_time}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4" />
                <span className="font-body">{recipe.servings} porzioni</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Ingredients */}
            <div>
              <h2 className="font-heading text-xl font-semibold mb-4">Ingredienti</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 font-body">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="font-heading text-xl font-semibold mb-4">Procedimento</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 font-body">
                    <span className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {recipe.tips && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading font-semibold text-sm mb-1">Consiglio dello Chef</h3>
                    <p className="font-body text-sm italic">{recipe.tips}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Substitutions */}
            {recipe.substitutions && recipe.substitutions.length > 0 && (
              <div>
                <h3 className="font-heading text-lg font-semibold mb-3">Sostituzioni</h3>
                <ul className="space-y-2">
                  {recipe.substitutions.map((sub, i) => (
                    <li key={i} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                      <span className="text-secondary">→</span>
                      {sub}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={shareRecipe}
                data-testid="share-shared-recipe"
                variant="outline"
                className="flex-1 rounded-xl font-body"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Condividi
              </Button>
              <Link to="/auth" className="flex-1">
                <Button className="w-full rounded-xl font-body">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Crea le Tue Ricette
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-6 bg-primary text-white">
          <CardContent className="pt-6 pb-6 text-center">
            <h2 className="font-heading text-xl font-bold mb-2">
              Ti piace questa ricetta?
            </h2>
            <p className="font-body opacity-90 mb-4">
              Con Smart Cooking puoi generare ricette personalizzate con i tuoi ingredienti!
            </p>
            <Link to="/auth">
              <Button 
                variant="secondary"
                data-testid="cta-register"
                className="rounded-full font-body bg-white text-primary hover:bg-white/90"
              >
                Inizia Gratis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SharedRecipePage;
