# BusinessBuilding - Commercieel Groei Model App

Een interactieve React applicatie voor het 7-daagse BusinessBuilding Commercieel Groei Model programma met AI-integratie.

## 🚀 Deployment naar Vercel (Stap-voor-stap)

### Stap 1: GitHub Account
1. Ga naar [github.com](https://github.com)
2. Maak een gratis account aan (of log in)

### Stap 2: Repository Aanmaken
1. Klik op het **+** icoon rechtsboven → **New repository**
2. Naam: `businessbuilding-app`
3. Kies **Public** of **Private**
4. Klik **Create repository**

### Stap 3: Code Uploaden naar GitHub
1. Op je nieuwe repository pagina, klik **uploading an existing file**
2. Sleep alle bestanden uit deze map naar het upload veld
3. Klik **Commit changes**

### Stap 4: Vercel Account & Deployment
1. Ga naar [vercel.com](https://vercel.com)
2. Klik **Sign Up** → **Continue with GitHub**
3. Autoriseer Vercel toegang tot je GitHub
4. Klik **Add New...** → **Project**
5. Selecteer je `businessbuilding-app` repository
6. Klik **Deploy**

### Stap 5: API Key Instellen (BELANGRIJK!)
Na de eerste deployment moet je je Anthropic API key toevoegen:

1. Ga naar [console.anthropic.com](https://console.anthropic.com)
2. Maak een account aan of log in
3. Ga naar **API Keys** en klik **Create Key**
4. Kopieer de API key

5. Ga terug naar Vercel → je project
6. Klik op **Settings** (bovenaan)
7. Klik op **Environment Variables** (links menu)
8. Voeg toe:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** [plak je API key hier]
9. Klik **Save**

10. Ga naar **Deployments** tab
11. Klik op de drie puntjes (...) naast de laatste deployment
12. Klik **Redeploy** → **Redeploy**

### Stap 6: Klaar! 🎉
Je app is nu live en verbonden met de AI!

---

## 💰 Kosten

### Vercel
- **Gratis** voor persoonlijk gebruik en kleine teams
- Betaalde plannen voor meer traffic/features

### Anthropic API
- Kosten per gebruik (pay-as-you-go)
- Gemiddeld ~€0,003-0,015 per analyse
- Een volledige 7-daagse workshop kost ongeveer €0,10-0,50 aan API calls

---

## 📁 Project Structuur

```
businessbuilding-app/
├── api/
│   └── chat.js           # Serverless API functie
├── src/
│   ├── main.jsx          # React entry point
│   ├── App.jsx           # Hoofdapplicatie
│   └── prompts.js        # AI System Prompts
├── public/
│   └── groeimodel.jpg    # Groeimodel afbeelding
├── index.html
├── package.json
├── vite.config.js
├── vercel.json           # Vercel configuratie
└── README.md
```

---

## 🔧 Lokaal Ontwikkelen

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

Let op: Lokaal werkt de AI niet zonder een proxy. Gebruik Vercel voor volledige functionaliteit.

---

## ✨ Features

- **7 Dagdelen Workflow**: Introductie → 5 Pijlers → Synthese
- **AI Chat Integratie**: Claude API voor elke fase
- **Document Doorgifte**: Analyses worden automatisch doorgegeven
- **Export Functie**: Download analyses als Markdown
- **Voortgang Tracking**: Visuele voortgangsindicator
- **BusinessBuilding Huisstijl**: Officiële kleuren en branding

---

## 🎨 Aanpassingen

### Kleuren wijzigen
In `src/App.jsx`, zoek het `brand` object:
```javascript
const brand = {
  darkBlue: '#001649',
  orange: '#F77F00',
  // etc.
};
```

### Groeimodel afbeelding vervangen
Vervang `public/groeimodel.jpg` met je eigen afbeelding.

### System Prompts aanpassen
In `src/prompts.js` kun je de AI-instructies per fase aanpassen.

---

## 📞 Support

Vragen? Neem contact op met BusinessBuilding.
