# Handels- und Investitionsbüro — Quellen der Website

`index.html` eine Ebene höher ist die fertige, eigenständige Seite (three.js r128 eingebettet).
Die Dateien hier sind ihre Bausteine. Nach einer Änderung neu bauen:

    cd tj-trade-office/src
    # three.min.js (r128) daneben ablegen: npm pack three@0.128.0, build/three.min.js
    python3 build.py      # schreibt index.html und artifact.html in diesen Ordner

| Datei | Inhalt |
|---|---|
| `data.js` | Quellenliste `SRC` (Nummern = Verweise im Text), Freie Wirtschaftszonen, Messen, Meldungen |
| `c_de.js` `c_ru.js` `c_en.js` `c_tj.js` | Alle Texte je Sprache, gleiche Schlüssel |
| `legal.js` | Impressum und Datenschutz (Entwurf, deutsch) |
| `hero.js` | WebGL-Gebirgsflug (Rauschen auf der GPU, an das Scrollen gekoppelt) |
| `app.js` | Routing per `#hash`, Rendering, Formulare, FWZ-Karte |
| `style.css` | Gestaltung, helles und dunkles Thema |
| `flags.js` | Flaggen TJ (amtliches Format 1:2) und DE, aus `flag-icons` 7.5.0 (MIT, © Panayiotis Lipiridis) |
| `ornament.js` | Adras-/Abrbandi-Ikatmuster, als SVG erzeugt (Bänder und Flächen, beide Themen) |

Neue Meldung: Eintrag in `NEWS` (`data.js`) + Text unter `news.items` in allen vier Sprachdateien + Quelle in `SRC`.
