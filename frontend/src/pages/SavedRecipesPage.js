import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import BottomNav from '../components/BottomNav';
import axios from 'axios';
import { 
  BookmarkIcon, Clock, Users, Trash2, Share2, 
  ChefHat, Loader2, BookOpen 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SavedRecipesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get(`${API}/recipes/saved`);
      setSavedRecipes(response.data);
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (savedId) => {
    try {
      await axios.delete(`${API}/recipes/saved/${savedId}`);
      setSavedRecipes(savedRecipes.filter(r => r.id !== savedId));
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const shareRecipe = async (recipe) => {
    const shareUrl = `${window.location.origin}/shared/${recipe.recipe_id}`;
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <BookmarkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold">Ricette Salvate</h1>
              <p className="text-xs text-muted-foreground font-body">
                {savedRecipes.length} ricette
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {savedRecipes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="font-heading text-xl font-semibold mb-2">Nessuna ricetta salvata</h2>
              <p className="font-body text-muted-foreground mb-6">
                Genera delle ricette e salvale per ritrovarle qui!
              </p>
              <Button 
                onClick={() => navigate('/generate')}
                data-testid="goto-generate-btn"
                className="rounded-full font-body"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Genera una Ricetta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedRecipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                data-testid={`saved-recipe-${recipe.id}`}
              >
                <CardHeader 
                  className="pb-2"
                  onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Badge className={`mb-2 ${categoryColors[recipe.category]}`}>
                        {categoryEmojis[recipe.category]} {recipe.category}
                      </Badge>
                      <CardTitle className="font-heading text-lg">{recipe.title}</CardTitle>
                      <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-body">{recipe.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-body">{recipe.servings} porzioni</span>
                    </div>
                  </div>
                </CardHeader>

                {expandedRecipe === recipe.id && (
                  <CardContent className="pt-4 border-t animate-fade-in">
                    {/* Ingredients */}
                    <div className="mb-4">
                      <h4 className="font-heading font-semibold mb-2">Ingredienti</h4>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="flex items-start gap-2 font-body text-sm">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div className="mb-4">
                      <h4 className="font-heading font-semibold mb-2">Procedimento</h4>
                      <ol className="space-y-2">
                        {recipe.instructions.map((step, i) => (
                          <li key={i} className="flex gap-2 font-body text-sm">
                            <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Tips */}
                    {recipe.tips && (
                      <div className="bg-accent/10 rounded-lg p-3 mb-4">
                        <p className="font-body text-sm italic">💡 {recipe.tips}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`share-${recipe.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          shareRecipe(recipe);
                        }}
                        className="flex-1 rounded-lg font-body"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Condividi
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        data-testid={`delete-${recipe.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecipe(recipe.id);
                        }}
                        className="rounded-lg font-body"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default SavedRecipesPage;
