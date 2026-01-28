import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { ChefHat, Sparkles, BookmarkIcon, Share2, ArrowRight, Crown, Clock, Users, X } from 'lucide-react';

// Recipe data with images
const featuredRecipes = [
  {
    id: 1,
    title: "Spaghetti ai Gamberi",
    image: "https://images.unsplash.com/photo-1762631178597-847861217da0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGElMjBkaXNoJTIwZGVsaWNpb3VzfGVufDB8fHx8MTc2OTYzNjYyMXww&ixlib=rb-4.1.0&q=85",
    category: "salato",
    prepTime: "15 min",
    cookTime: "20 min",
    servings: 4,
    description: "Un classico della cucina italiana: spaghetti con gamberi succosi, pomodorini freschi e un tocco di aglio.",
    ingredients: ["400g spaghetti", "300g gamberi sgusciati", "200g pomodorini", "3 spicchi d'aglio", "Prezzemolo fresco", "Olio EVO", "Peperoncino", "Sale e pepe"],
    instructions: ["Cuoci gli spaghetti in abbondante acqua salata", "In una padella, rosola l'aglio nell'olio", "Aggiungi i gamberi e cuoci per 2 minuti per lato", "Unisci i pomodorini tagliati a metà", "Scola la pasta e saltala in padella", "Completa con prezzemolo fresco tritato"]
  },
  {
    id: 2,
    title: "Spaghetti alle Vongole",
    image: "https://images.unsplash.com/photo-1768204038645-b50312187392?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxpdGFsaWFuJTIwcGFzdGElMjBkaXNoJTIwZGVsaWNpb3VzfGVufDB8fHx8MTc2OTYzNjYyMXww&ixlib=rb-4.1.0&q=85",
    category: "salato",
    prepTime: "20 min",
    cookTime: "15 min",
    servings: 4,
    description: "Il profumo del mare in un piatto: vongole veraci, aglio, prezzemolo e un filo di vino bianco.",
    ingredients: ["400g spaghetti", "1kg vongole veraci", "4 spicchi d'aglio", "1 bicchiere vino bianco", "Prezzemolo", "Olio EVO", "Peperoncino"],
    instructions: ["Spurga le vongole in acqua salata per 2 ore", "Fai aprire le vongole in padella con aglio e olio", "Sfuma con il vino bianco", "Cuoci gli spaghetti al dente", "Unisci la pasta alle vongole", "Manteca e servi con prezzemolo"]
  },
  {
    id: 3,
    title: "Lasagna al Ragù",
    image: "https://images.unsplash.com/photo-1760390952710-b0e010ec4e50?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxpdGFsaWFuJTIwcGFzdGElMjBkaXNoJTIwZGVsaWNpb3VzfGVufDB8fHx8MTc2OTYzNjYyMXww&ixlib=rb-4.1.0&q=85",
    category: "salato",
    prepTime: "45 min",
    cookTime: "1 ora",
    servings: 6,
    description: "La regina dei primi piatti: sfoglie di pasta, ragù bolognese, besciamella e tanto parmigiano.",
    ingredients: ["500g sfoglie lasagna", "500g ragù bolognese", "500ml besciamella", "200g parmigiano", "Noce moscata", "Burro"],
    instructions: ["Prepara il ragù bolognese", "Prepara la besciamella cremosa", "Alterna strati di pasta, ragù e besciamella", "Termina con besciamella e parmigiano", "Inforna a 180°C per 40 minuti", "Lascia riposare 10 minuti prima di servire"]
  },
  {
    id: 4,
    title: "Tiramisù Classico",
    image: "https://images.unsplash.com/photo-1763585055888-9eb25fe6c997?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwZGVzc2VydCUyMHRpcmFtaXN1JTIwY2FrZXxlbnwwfHx8fDE3Njk2MzY2MjN8MA&ixlib=rb-4.1.0&q=85",
    category: "dolce",
    prepTime: "30 min",
    cookTime: "4 ore riposo",
    servings: 8,
    description: "Il dolce italiano più amato al mondo: mascarpone, savoiardi, caffè espresso e cacao.",
    ingredients: ["500g mascarpone", "4 uova", "100g zucchero", "300g savoiardi", "300ml caffè espresso", "Cacao amaro", "Marsala (opzionale)"],
    instructions: ["Prepara il caffè e lascialo raffreddare", "Separa i tuorli dagli albumi", "Monta i tuorli con lo zucchero", "Aggiungi il mascarpone e mescola", "Incorpora gli albumi montati a neve", "Alterna strati di savoiardi inzuppati e crema", "Spolverizza con cacao e refrigera 4 ore"]
  },
  {
    id: 5,
    title: "Torta al Cioccolato",
    image: "https://images.pexels.com/photos/32260669/pexels-photo-32260669.jpeg",
    category: "dolce",
    prepTime: "20 min",
    cookTime: "35 min",
    servings: 8,
    description: "Morbida, cioccolatosa e irresistibile: la torta perfetta per ogni occasione.",
    ingredients: ["200g cioccolato fondente", "200g burro", "200g zucchero", "4 uova", "100g farina", "1 cucchiaino lievito"],
    instructions: ["Sciogli cioccolato e burro a bagnomaria", "Monta le uova con lo zucchero", "Incorpora il cioccolato fuso", "Aggiungi farina e lievito setacciati", "Versa in uno stampo imburrato", "Cuoci a 180°C per 30-35 minuti"]
  },
  {
    id: 6,
    title: "Pizza Margherita",
    image: "https://images.unsplash.com/photo-1764705309243-c47cbc9792e4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxwaXp6YSUyMG1hcmdoZXJpdGElMjBmcmVzaHxlbnwwfHx8fDE3Njk2MzY2MjZ8MA&ixlib=rb-4.1.0&q=85",
    category: "veloce",
    prepTime: "15 min",
    cookTime: "10 min",
    servings: 2,
    description: "La pizza napoletana per eccellenza: pomodoro San Marzano, mozzarella di bufala e basilico fresco.",
    ingredients: ["250g impasto pizza", "150g pomodoro San Marzano", "200g mozzarella di bufala", "Basilico fresco", "Olio EVO", "Sale"],
    instructions: ["Stendi l'impasto a mano", "Distribuisci il pomodoro schiacciato", "Aggiungi la mozzarella a pezzi", "Condisci con olio e sale", "Inforna a 250°C per 8-10 minuti", "Completa con basilico fresco"]
  },
  {
    id: 7,
    title: "Fettuccine Alfredo",
    image: "https://images.unsplash.com/photo-1756362845792-496030ecbea0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHw0fHxpdGFsaWFuJTIwcGFzdGElMjBkaXNoJTIwZGVsaWNpb3VzfGVufDB8fHx8MTc2OTYzNjYyMXww&ixlib=rb-4.1.0&q=85",
    category: "veloce",
    prepTime: "10 min",
    cookTime: "12 min",
    servings: 4,
    description: "Cremose fettuccine avvolte in una salsa vellutata di burro e parmigiano.",
    ingredients: ["400g fettuccine", "100g burro", "200g parmigiano", "Pepe nero", "Noce moscata"],
    instructions: ["Cuoci le fettuccine al dente", "Sciogli il burro in padella", "Aggiungi la pasta con un po' di acqua di cottura", "Manteca con il parmigiano grattugiato", "Aggiusta con pepe e noce moscata", "Servi immediatamente"]
  },
  {
    id: 8,
    title: "Pizza Quattro Formaggi",
    image: "https://images.unsplash.com/photo-1762631179015-e8e8239f0ecf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHw0fHxwaXp6YSUyMG1hcmdoZXJpdGElMjBmcmVzaHxlbnwwfHx8fDE3Njk2MzY2MjZ8MA&ixlib=rb-4.1.0&q=85",
    category: "salato",
    prepTime: "15 min",
    cookTime: "12 min",
    servings: 2,
    description: "Un'esplosione di sapori: mozzarella, gorgonzola, fontina e parmigiano su base croccante.",
    ingredients: ["250g impasto pizza", "100g mozzarella", "80g gorgonzola", "80g fontina", "50g parmigiano", "Olio EVO"],
    instructions: ["Stendi l'impasto in una teglia", "Distribuisci la mozzarella a dadini", "Aggiungi gorgonzola e fontina a pezzi", "Spolverizza con parmigiano", "Condisci con un filo d'olio", "Inforna a 250°C per 10-12 minuti"]
  },
  {
    id: 9,
    title: "Penne alla Vodka",
    image: "https://images.pexels.com/photos/5175587/pexels-photo-5175587.jpeg",
    category: "veloce",
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 4,
    description: "Un primo piatto cremoso e leggermente piccante con un tocco di vodka per esaltare i sapori.",
    ingredients: ["400g penne", "200ml panna", "200g passata di pomodoro", "50ml vodka", "Parmigiano", "Peperoncino", "Cipolla"],
    instructions: ["Soffriggi la cipolla tritata", "Aggiungi la passata e cuoci 5 minuti", "Sfuma con la vodka e lascia evaporare", "Unisci la panna e mescola", "Scola le penne e saltale nel sugo", "Completa con parmigiano"]
  }
];

const categoryColors = {
  salato: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-100' },
  dolce: { bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-100' },
  veloce: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-100' }
};

const categoryEmojis = {
  salato: '🍝',
  dolce: '🍰',
  veloce: '⚡'
};

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredRecipes = filter === 'all' 
    ? featuredRecipes 
    : featuredRecipes.filter(r => r.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      {/* Hero Section with colorful background */}
      <section className="relative overflow-hidden">
        {/* Colorful gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E05D3A' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative z-10 px-4 py-8 md:py-16">
          {/* Header */}
          <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <span className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Smart Cooking
              </span>
            </div>
            
            {user ? (
              <Link to="/generate">
                <Button data-testid="header-genera-btn" className="rounded-full font-body shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-orange-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Genera Ricetta
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button data-testid="header-login-btn" className="rounded-full font-body shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-orange-600">
                  Accedi
                </Button>
              </Link>
            )}
          </header>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-primary px-5 py-2.5 rounded-full text-sm font-body shadow-lg">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Ricette Generate con AI</span>
            </div>
            
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Scopri ricette 
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                deliziose
              </span>
            </h1>
            
            <p className="font-body text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Clicca su una ricetta per scoprire ingredienti e istruzioni, 
              oppure genera ricette personalizzate con i tuoi ingredienti!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to={user ? "/generate" : "/auth"}>
                <Button 
                  data-testid="hero-start-btn"
                  size="lg" 
                  className="rounded-full px-10 py-7 text-lg font-body font-semibold shadow-xl shadow-primary/30 bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <ChefHat className="w-6 h-6 mr-2" />
                  Crea la Tua Ricetta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-6 px-4 bg-white/50 backdrop-blur sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={`rounded-full font-body ${filter === 'all' ? 'bg-gradient-to-r from-primary to-orange-500 shadow-lg' : 'bg-white hover:bg-gray-50'}`}
              data-testid="filter-all"
            >
              🍴 Tutte
            </Button>
            <Button
              variant={filter === 'salato' ? 'default' : 'outline'}
              onClick={() => setFilter('salato')}
              className={`rounded-full font-body ${filter === 'salato' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg' : 'bg-white hover:bg-emerald-50'}`}
              data-testid="filter-salato"
            >
              🍝 Salato
            </Button>
            <Button
              variant={filter === 'dolce' ? 'default' : 'outline'}
              onClick={() => setFilter('dolce')}
              className={`rounded-full font-body ${filter === 'dolce' ? 'bg-pink-500 hover:bg-pink-600 shadow-lg' : 'bg-white hover:bg-pink-50'}`}
              data-testid="filter-dolce"
            >
              🍰 Dolce
            </Button>
            <Button
              variant={filter === 'veloce' ? 'default' : 'outline'}
              onClick={() => setFilter('veloce')}
              className={`rounded-full font-body ${filter === 'veloce' ? 'bg-amber-500 hover:bg-amber-600 shadow-lg' : 'bg-white hover:bg-amber-50'}`}
              data-testid="filter-veloce"
            >
              ⚡ Veloce
            </Button>
          </div>
        </div>
      </section>

      {/* Recipe Gallery */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Ricette in Evidenza
            </span>
          </h2>
          <p className="font-body text-gray-600 text-center mb-10 text-lg">
            Clicca su una ricetta per vedere ingredienti e istruzioni
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card 
                key={recipe.id}
                className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
                onClick={() => setSelectedRecipe(recipe)}
                data-testid={`recipe-card-${recipe.id}`}
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <Badge className={`absolute top-4 left-4 ${categoryColors[recipe.category].bg} text-white font-body shadow-lg`}>
                    {categoryEmojis[recipe.category]} {recipe.category}
                  </Badge>
                  
                  {/* Click indicator */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <ChefHat className="w-5 h-5 text-primary" />
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-heading text-xl font-bold text-white mb-1 drop-shadow-lg">
                      {recipe.title}
                    </h3>
                    <div className="flex gap-3 text-white/90 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.prepTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} pers.
                      </span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <p className="font-body text-gray-600 text-sm line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-sm font-body font-semibold ${categoryColors[recipe.category].text}`}>
                      Vedi ricetta →
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Crown className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Crea ricette uniche con AI
          </h2>
          <p className="font-body text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Inserisci i tuoi ingredienti e lascia che l'intelligenza artificiale 
            crei ricette personalizzate solo per te!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/generate" : "/auth"}>
              <Button 
                data-testid="cta-start-btn"
                size="lg"
                className="rounded-full px-10 py-7 text-lg font-body font-semibold bg-white text-primary hover:bg-gray-100 shadow-xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Inizia Gratis
              </Button>
            </Link>
            <Link to="/pricing">
              <Button 
                data-testid="cta-pricing-btn"
                size="lg"
                variant="outline"
                className="rounded-full px-10 py-7 text-lg font-body font-semibold border-2 border-white text-white hover:bg-white/10"
              >
                Vedi Piani
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-body text-sm text-gray-500">
              Smart Cooking © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/pricing" className="font-body text-sm text-gray-500 hover:text-primary transition-colors">
              Prezzi
            </Link>
            <a 
              href="https://app.emergent.sh/?utm_source=emergent-badge" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-body text-sm text-gray-500 hover:text-primary transition-colors"
            >
              Made with Emergent
            </a>
          </div>
        </div>
      </footer>

      {/* Recipe Modal */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {selectedRecipe && (
            <>
              {/* Recipe Header Image */}
              <div className="relative h-64">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <Badge className={`absolute top-4 left-4 ${categoryColors[selectedRecipe.category].bg} text-white font-body shadow-lg`}>
                  {categoryEmojis[selectedRecipe.category]} {selectedRecipe.category}
                </Badge>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-heading text-3xl font-bold text-white mb-2">
                    {selectedRecipe.title}
                  </h2>
                  <div className="flex gap-4 text-white/90 text-sm">
                    <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      Prep: {selectedRecipe.prepTime}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      Cottura: {selectedRecipe.cookTime}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" />
                      {selectedRecipe.servings} porzioni
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Description */}
                <p className="font-body text-gray-600 text-lg leading-relaxed">
                  {selectedRecipe.description}
                </p>
                
                {/* Ingredients */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5">
                  <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white text-sm">🥗</span>
                    Ingredienti
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 font-body text-gray-700">
                        <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Instructions */}
                <div>
                  <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">👨‍🍳</span>
                    Procedimento
                  </h3>
                  <ol className="space-y-4">
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4 font-body">
                        <span className="w-8 h-8 bg-gradient-to-br from-primary to-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                          {i + 1}
                        </span>
                        <span className="pt-1 text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* CTA */}
                <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-heading font-bold text-lg">Vuoi personalizzare?</h4>
                    <p className="font-body text-sm text-gray-600">Genera ricette con i tuoi ingredienti!</p>
                  </div>
                  <Link to={user ? "/generate" : "/auth"}>
                    <Button className="rounded-full font-body bg-gradient-to-r from-primary to-orange-500 shadow-lg" data-testid="modal-generate-btn">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Genera Ricetta
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
