# Handels- und Investitionsbüro — Quellen der Website

`index.html`, `ru.html`, `en.html`, `tj.html` eine Ebene höher sind die fertigen Seiten.
Die Dateien hier sind ihre Bausteine. Nach einer Änderung neu bauen (vom Wurzelordner aus):

    python3 src/build.py   # schreibt index.html, ru.html, en.html, tj.html in den Wurzelordner

Regeln für Inhalte und Arbeitsablauf: `CLAUDE.md` im Wurzelordner.

| Datei | Inhalt |
|---|---|
| `data.js` | Quellenliste `SRC` (Nummern = Verweise im Text), Freie Wirtschaftszonen, Messen, Meldungen |
| `c_de.js` `c_ru.js` `c_en.js` `c_tj.js` | Alle Texte je Sprache, gleiche Schlüssel |
| `legal.js` | Impressum und Datenschutz (Entwurf, deutsch) |
| `hero.js` | Scroll-Steuerung des Einstiegs: Kapitel, Fortschritt und der gefilmte Flug (Einzelbilder, an das Scrollen gekoppelt) |
| `terrain.js` | Ersatzszene ohne Filmmaterial: WebGL-Gebirge (Rauschen auf der GPU); wird nur eingebunden, wenn `media/` keinen Hero enthält |
| `media.py` | Bereitet `raw/` (Higgsfield-Ausgaben) für das Web auf: Einzelbilder, WebP, MP4/WebM, `media/manifest.json` — siehe `MEDIA-JOBS.md` |
| `app.js` | Routing per `#hash`, Rendering, Formulare, FWZ-Karte |
| `style.css` | Gestaltung, helles und dunkles Thema |
| `flags.js` | Flaggen TJ (amtliches Format 1:2) und DE, aus `flag-icons` 7.5.0 (MIT, © Panayiotis Lipiridis) |
| `ornament.js` | Adras-/Abrbandi-Ikatmuster, als SVG erzeugt (Bänder und Flächen, beide Themen) |

Neue Meldung: Eintrag in `NEWS` (`data.js`) + Text unter `news.items` in allen vier Sprachdateien + Quelle in `SRC`.
