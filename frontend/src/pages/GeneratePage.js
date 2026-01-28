import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import BottomNav from '../components/BottomNav';
import axios from 'axios';
import { 
  ChefHat, Plus, X, Sparkles, Clock, Users, Lightbulb, 
  Bookmark, Share2, Loader2, AlertCircle 
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GeneratePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState('salato');
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim().toLowerCase())) {
      setIngredients([...ingredients, inputValue.trim().toLowerCase()]);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const generateRecipe = async () => {
    if (ingredients.length < 2) {
      setError('Aggiungi almeno 2 ingredienti');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe(null);
    setSaved(false);

    try {
      const response = await axios.post(`${API}/recipes/generate`, {
        ingredients,
        category,
        servings
      });
      setRecipe(response.data);
      await refreshUser();
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.detail);
      } else {
        setError(err.response?.data?.detail || 'Errore nella generazione. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    if (!recipe) return;
    
    try {
      await axios.post(`${API}/recipes/${recipe.id}/save`);
      setSaved(true);
    } catch (err) {
      if (err.response?.status === 400) {
        setSaved(true); // Already saved
      }
    }
  };

  const shareRecipe = async () => {
    if (!recipe) return;
    
    const shareUrl = `${window.location.origin}/shared/${recipe.id}`;
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

  const recipesLeft = user?.plan === 'unlimited' 
    ? '∞' 
    : (50 - (user?.recipes_generated_this_month || 0));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold">Genera Ricetta</h1>
              <p className="text-xs text-muted-foreground font-body">
                {recipesLeft} ricette rimanenti questo mese
              </p>
            </div>
          </div>
          {user?.plan !== 'unlimited' && (
            <Button 
              variant="outline" 
              size="sm"
              data-testid="upgrade-btn"
              onClick={() => navigate('/pricing')}
              className="rounded-full font-body text-xs"
            >
              Upgrade
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Category Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="salato" data-testid="category-salato" className="font-body">
                  🍝 Salato
                </TabsTrigger>
                <TabsTrigger value="dolce" data-testid="category-dolce" className="font-body">
                  🍰 Dolce
                </TabsTrigger>
                <TabsTrigger value="veloce" data-testid="category-veloce" className="font-body">
                  ⚡ Veloce
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Ingredients Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">Ingredienti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                data-testid="ingredient-input"
                placeholder="Aggiungi un ingrediente..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-12 font-body"
              />
              <Button 
                onClick={addIngredient}
                data-testid="add-ingredient-btn"
                size="icon"
                className="h-12 w-12 rounded-xl"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <Badge 
                    key={ingredient}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm font-body flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeIngredient(ingredient)}
                  >
                    {ingredient}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground font-body">
              {ingredients.length}/2 ingredienti minimi
            </p>
          </CardContent>
        </Card>

        {/* Servings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Porzioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                data-testid="servings-minus"
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="rounded-xl"
              >
                -
              </Button>
              <span className="text-2xl font-heading font-bold w-12 text-center">{servings}</span>
              <Button
                variant="outline"
                size="icon"
                data-testid="servings-plus"
                onClick={() => setServings(Math.min(12, servings + 1))}
                className="rounded-xl"
              >
                +
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={generateRecipe}
          disabled={loading || ingredients.length < 2}
          data-testid="generate-btn"
          className="w-full h-14 rounded-2xl font-body font-semibold text-lg shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generazione in corso...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Genera Ricetta
            </>
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-destructive">{error}</p>
                {error.includes('limite') && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary font-body"
                    onClick={() => navigate('/pricing')}
                  >
                    Passa a Unlimited →
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipe Result */}
        {recipe && (
          <Card className="animate-fade-in overflow-hidden" data-testid="recipe-result">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
              <h2 className="font-heading text-2xl font-bold mb-2">{recipe.title}</h2>
              <p className="font-body opacity-90">{recipe.description}</p>
              
              <div className="flex gap-4 mt-4">
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
                <h3 className="font-heading text-lg font-semibold mb-3">Ingredienti</h3>
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
                <h3 className="font-heading text-lg font-semibold mb-3">Procedimento</h3>
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
                      <h4 className="font-heading font-semibold text-sm mb-1">Consiglio dello Chef</h4>
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
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveRecipe}
                  disabled={saved}
                  data-testid="save-recipe-btn"
                  variant={saved ? "secondary" : "outline"}
                  className="flex-1 rounded-xl font-body"
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${saved ? 'fill-current' : ''}`} />
                  {saved ? 'Salvata!' : 'Salva'}
                </Button>
                <Button
                  onClick={shareRecipe}
                  data-testid="share-recipe-btn"
                  variant="outline"
                  className="flex-1 rounded-xl font-body"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Condividi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default GeneratePage;
