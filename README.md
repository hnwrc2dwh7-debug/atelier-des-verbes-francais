# Milo — Le labo des verbes

Mini-site interactif en français pour explorer la conjugaison, comprendre quelques usages des temps et s’entraîner avec des questions adaptées au niveau scolaire.

## Contenu

- 14 833 verbes indexés ; 12 855 paradigmes complets selon le contrôle des formes simples retenues, de l’infinitif et des participes.
- 23 temps et formes répartis entre les modes, plus trois constructions utiles (futur proche, passé récent et présent progressif).
- Temps composés construits à partir des auxiliaires. Un choix d’auxiliaire est proposé pour plusieurs verbes dont l’emploi varie selon le sens.
- Quiz à questions écrites ou à choix multiples, avec tirage aléatoire, filtres et questions générées à partir du dictionnaire.

## Limites pédagogiques

Les lexiques sont assemblés automatiquement à partir de données ouvertes et ne sont pas vérifiés individuellement entrée par entrée. Le calcul des paradigmes complets porte sur les formes répertoriées par le site ; il ne garantit pas que chaque variante, locution, emploi ou forme surcomposée rare soit couverte. Les formes manquantes sont signalées. Pour un devoir noté, vérifie les cas rares avec le cours ou un dictionnaire de référence.

## Lancer en local

Ouvre le dossier dans un serveur statique (par exemple `python3 -m http.server`) pour que `data/verbs.json` puisse être chargé. Aucun paquet externe n’est nécessaire.

## GitHub Pages

Dans GitHub, ouvre **Settings → Pages**, choisis la branche `main`, puis le dossier `/ (root)`. Le fichier `.nojekyll` est inclus.

## Sources et licences

Les références pédagogiques et les sources des données sont indiquées sur le site. Les textes de licence et avis d’attribution sont dans `data/`.
