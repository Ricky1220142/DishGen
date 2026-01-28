import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import BottomNav from '../components/BottomNav';
import { 
  User, Crown, ChefHat, LogOut, Settings, 
  CreditCard, ArrowRight, Sparkles 
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const recipesUsed = user?.recipes_generated_this_month || 0;
  const recipesLimit = user?.plan === 'unlimited' ? Infinity : 50;
  const usagePercent = user?.plan === 'unlimited' ? 0 : (recipesUsed / 50) * 100;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold">Profilo</h1>
              <p className="text-xs text-muted-foreground font-body">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-xl font-semibold">{user?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {user?.plan === 'unlimited' ? (
                    <Badge className="bg-accent text-accent-foreground">
                      <Crown className="w-3 h-3 mr-1" />
                      Unlimited
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Piano Gratuito
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Utilizzo Mensile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.plan === 'unlimited' ? (
              <div className="text-center py-4">
                <p className="font-body text-2xl font-bold text-primary">∞</p>
                <p className="font-body text-muted-foreground">Ricette illimitate!</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Ricette generate</span>
                  <span className="font-heading font-semibold">
                    {recipesUsed} / {recipesLimit}
                  </span>
                </div>
                <Progress value={usagePercent} className="h-3" />
                <p className="font-body text-sm text-muted-foreground">
                  {50 - recipesUsed} ricette rimanenti questo mese
                </p>
                
                {usagePercent >= 80 && (
                  <Button 
                    onClick={() => navigate('/pricing')}
                    data-testid="profile-upgrade-btn"
                    className="w-full rounded-xl font-body"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Passa a Unlimited
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Card */}
        {user?.plan !== 'unlimited' && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold">Passa a Unlimited</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    Ricette illimitate a soli €2,99/mese
                  </p>
                  <Button 
                    onClick={() => navigate('/pricing')}
                    data-testid="profile-subscribe-btn"
                    size="sm"
                    className="mt-3 rounded-full font-body"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Abbonati Ora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start font-body h-12"
              onClick={() => navigate('/saved')}
            >
              <Settings className="w-5 h-5 mr-3" />
              Le Mie Ricette Salvate
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start font-body h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Esci
            </Button>
          </CardContent>
        </Card>

        {/* Member Since */}
        <p className="text-center font-body text-sm text-muted-foreground">
          Membro dal {new Date(user?.created_at).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
