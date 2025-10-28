# Social Media Content Checker

Eine moderne Web-Anwendung für Community Manager und Social Media Redakteure zur Prüfung von Texten und Bildern nach festgelegten Qualitätskriterien.

## Features

- **Text-Analyse**: Prüfung von Social Media Texten nach professionellen Kriterien
- **Bild-Analyse**: Bewertung von Bildern für optimale Social Media Performance
- **Kriterien-Management**: Anpassbare Prüfkriterien mit individueller Gewichtung
- **Echtzeit-Feedback**: Sofortige Analyse mit detailliertem Feedback und Verbesserungsvorschlägen
- **Bewertungssystem**: Übersichtliche Bewertung mit Score (0-100) und visuellen Indikatoren

## Prüfkriterien

### Text-Kriterien
- **Textlänge**: Optimal 100-280 Zeichen für maximales Engagement
- **Hashtags**: 2-5 relevante Hashtags empfohlen
- **Emoji-Verwendung**: Moderate Verwendung (1-3 Emojis)
- **Lesbarkeit**: Klare, verständliche Sprache
- **Call-to-Action**: Klare Handlungsaufforderung
- **Tonalität**: Professionell und markenkonform

### Bild-Kriterien
- **Bildqualität**: Hochauflösend (mind. 1080x1080 Pixel)
- **Branding**: Logo oder Markenelemente sichtbar
- **Komposition**: Ausgewogene Bildgestaltung
- **Text im Bild**: Lesbar und unter 20% der Bildfläche
- **Format**: Passende Seitenverhältnisse (1:1, 16:9, 9:16, 4:5)

## Installation

### Voraussetzungen
- Node.js 18+
- npm oder yarn

### Schritte

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd social-media-content-checker
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

4. **App im Browser öffnen**
   ```
   http://localhost:3000
   ```

## Verwendung

### Text prüfen
1. Wechseln Sie zum Tab "Text prüfen"
2. Geben Sie Ihren Social Media Text ein
3. Klicken Sie auf "Text analysieren"
4. Erhalten Sie sofortiges Feedback mit:
   - Gesamtbewertung (0-100)
   - Detaillierte Bewertung pro Kriterium
   - Konkrete Verbesserungsvorschläge

### Bild prüfen
1. Wechseln Sie zum Tab "Bild prüfen"
2. Laden Sie ein Bild hoch (PNG, JPG, GIF bis 10MB)
3. Klicken Sie auf "Bild analysieren"
4. Erhalten Sie eine umfassende Bewertung

### Kriterien anpassen
1. Wechseln Sie zum Tab "Kriterien"
2. Aktivieren/Deaktivieren Sie einzelne Kriterien
3. Passen Sie die Gewichtung (1-10) an
4. Einstellungen werden automatisch gespeichert

## Technologie-Stack

- **Framework**: Next.js 14 (App Router)
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Analyse**: Eigene regelbasierte Analyse-Engine

## Projektstruktur

```
social-media-content-checker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── analyze-text/  # Text-Analyse API
│   │   │   └── analyze-image/ # Bild-Analyse API
│   │   ├── layout.tsx         # Root Layout
│   │   ├── page.tsx           # Hauptseite
│   │   └── globals.css        # Globale Styles
│   ├── components/            # React Komponenten
│   │   ├── TextChecker.tsx    # Text-Analyse Komponente
│   │   ├── ImageChecker.tsx   # Bild-Analyse Komponente
│   │   ├── CriteriaManager.tsx # Kriterien-Verwaltung
│   │   └── AnalysisResults.tsx # Ergebnis-Anzeige
│   ├── lib/                   # Utility-Funktionen
│   │   ├── textAnalyzer.ts    # Text-Analyse-Engine
│   │   └── imageAnalyzer.ts   # Bild-Analyse-Engine
│   ├── types/                 # TypeScript Typen
│   │   └── index.ts
│   └── data/                  # Daten
│       └── defaultCriteria.ts # Standard-Kriterien
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Build für Produktion

```bash
# Build erstellen
npm run build

# Production Server starten
npm start
```

## Weitere Entwicklung

### Mögliche Erweiterungen
- **KI-Integration**: Integration von OpenAI/Claude für fortgeschrittene Text- und Bildanalyse
- **Datenbank**: Speicherung von Analysen und eigenen Kriterien
- **Mehrsprachigkeit**: Unterstützung weiterer Sprachen
- **Team-Features**: Mehrbenutzer-Unterstützung mit Rollen
- **Export-Funktion**: PDF-Reports der Analysen
- **A/B-Testing**: Vergleich verschiedener Versionen
- **Plattform-spezifische Kriterien**: Separate Kriterien für Instagram, LinkedIn, Twitter, etc.
- **Terminplanung**: Integration mit Social Media Planern

## Lizenz

MIT

## Support

Bei Fragen oder Problemen öffnen Sie bitte ein Issue im Repository.
