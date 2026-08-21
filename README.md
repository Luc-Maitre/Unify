# Unify — Plugin Figma

Plugin compagnon pour les **product designers**, conçu pour faciliter la conception de maquettes sur Figma.

## Objectif

Unify accompagne les designers :

- **Transition de rebranding** — détecte les instances de composants obsolètes et les remplace par les nouveaux composants de la bibliothèque cible, en masse ou sur une sélection.
- **Application des guidelines UI** — aide à respecter les règles et bonnes pratiques du design system au fil de la conception.

## Prérequis

- [Node.js](https://nodejs.org/) (inclut npm)

## Installation

```bash
npm install
```

## Développement

```bash
npm run watch
```

Le plugin se recompile automatiquement à chaque sauvegarde.

## Build production

```bash
npm run build
```

## Chargement dans Figma

1. Ouvrir Figma Desktop
2. Menu **Plugins > Development > Import plugin from manifest...**
3. Sélectionner le fichier `manifest.json` à la racine du projet
