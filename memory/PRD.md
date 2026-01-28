# Smart Cooking PWA - PRD

## Problem Statement
Trasformare il sito web Smart Cooking (pagina pricing) in un'applicazione PWA completa per generare ricette AI con ingredienti disponibili.

## User Persona
- **Target**: Utenti italiani che vogliono cucinare con ingredienti disponibili
- **Comportamento**: Principianti e chef amatoriali che cercano ispirazione
- **Dispositivi**: Mobile-first, ma funziona anche su desktop

## Core Requirements
1. ✅ Autenticazione utenti (registrazione/login)
2. ✅ Generazione ricette AI con Gemini
3. ✅ Categorie: Salato, Dolce, Veloce
4. ✅ Salvataggio ricette preferite
5. ✅ Condivisione ricette con link
6. ✅ Sistema abbonamento (Free: 50/mese, Unlimited: €2.99/mese)
7. ✅ PWA installabile su dispositivi

## Architecture
- **Frontend**: React 19 + TailwindCSS + Shadcn UI
- **Backend**: FastAPI + MongoDB + Motor
- **AI**: Gemini 3 Flash via Emergent LLM Key
- **Payments**: Stripe Checkout
- **Auth**: JWT (7 giorni)

## What's Been Implemented (Jan 2026)

### Backend APIs
- `/api/auth/register` - Registrazione utente
- `/api/auth/login` - Login utente
- `/api/auth/me` - Info utente corrente
- `/api/recipes/generate` - Generazione ricetta AI
- `/api/recipes/{id}/save` - Salva ricetta
- `/api/recipes/saved` - Lista ricette salvate
- `/api/recipes/shared/{id}` - Ricetta condivisa
- `/api/payments/checkout` - Crea sessione Stripe
- `/api/payments/status/{id}` - Verifica pagamento
- `/api/webhook/stripe` - Webhook Stripe

### Frontend Pages
- Landing Page (/) - Hero, features, CTA
- Auth Page (/auth) - Login/Register
- Generate Page (/generate) - Genera ricette
- Saved Page (/saved) - Ricette salvate
- Pricing Page (/pricing) - Piani abbonamento
- Profile Page (/profile) - Info utente
- Shared Page (/shared/:id) - Ricetta condivisa
- Payment Success (/payment-success) - Conferma pagamento

### PWA Features
- manifest.json configurato
- Service Worker per caching
- Installabile da browser
- Responsive design (mobile-first)

## Design System
- **Nome**: Digital Trattoria
- **Font Heading**: Playfair Display
- **Font Body**: Manrope
- **Colore Primary**: #E05D3A (Terra Cotta)
- **Colore Secondary**: #5C6B45 (Olive Grove)
- **Background**: #FDFBF7 (Flour)

## Backlog / Future Features

### P1 (High Priority)
- [ ] Immagini ricette generate con AI
- [ ] Cronologia ricette generate
- [ ] Filtri per allergeni/diete

### P2 (Medium Priority)
- [ ] Notifiche push per ricette del giorno
- [ ] Lista della spesa automatica
- [ ] Timer di cottura integrato

### P3 (Nice to Have)
- [ ] Integrazione con assistenti vocali
- [ ] Video tutorial per ricette
- [ ] Community e commenti

## Next Tasks
1. Aggiungere generazione immagini ricette
2. Implementare cronologia ricette generate
3. Aggiungere filtri per diete speciali
