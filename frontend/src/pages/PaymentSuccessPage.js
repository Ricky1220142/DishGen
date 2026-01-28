import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ChefHat, PartyPopper } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setStatus('error');
    }
  }, []);

  const pollPaymentStatus = async (sessionId) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('error');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        await refreshUser();
        return;
      } else if (response.data.status === 'expired') {
        setStatus('error');
        return;
      }

      // Continue polling
      setAttempts(prev => prev + 1);
      setTimeout(() => pollPaymentStatus(sessionId), pollInterval);
    } catch (error) {
      console.error('Payment status error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardContent className="pt-8 pb-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-6" />
              <h1 className="font-heading text-2xl font-bold mb-2">Verifica pagamento...</h1>
              <p className="font-body text-muted-foreground">
                Stiamo verificando il tuo pagamento. Un momento per favore.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="relative">
                <CheckCircle className="w-20 h-20 mx-auto text-secondary mb-4" />
                <PartyPopper className="w-8 h-8 absolute top-0 right-1/4 text-accent animate-bounce" />
              </div>
              <h1 className="font-heading text-2xl font-bold mb-2">
                Pagamento completato!
              </h1>
              <p className="font-body text-muted-foreground mb-6">
                Benvenuto nel piano Unlimited! Ora puoi generare ricette illimitate.
              </p>
              <Button 
                onClick={() => navigate('/generate')}
                data-testid="goto-generate-success"
                className="rounded-full font-body px-8"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Inizia a Cucinare
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-20 h-20 mx-auto text-destructive mb-4" />
              <h1 className="font-heading text-2xl font-bold mb-2">
                Qualcosa è andato storto
              </h1>
              <p className="font-body text-muted-foreground mb-6">
                Non siamo riusciti a verificare il pagamento. 
                Contattaci se il problema persiste.
              </p>
              <Button 
                onClick={() => navigate('/pricing')}
                data-testid="goto-pricing-error"
                variant="outline"
                className="rounded-full font-body"
              >
                Torna ai Piani
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
