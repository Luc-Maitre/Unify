# Unify — Plugin Figma

Plugin compagnon pour les product designers Leboncoin. Il regroupe des outils pour faciliter le travail au quotidien sur Figma, notamment pendant la transition Spark.

---

## Outils disponibles

### Easy Swap
Remplace en masse les composants obsolètes par leurs équivalents dans la librairie Spark. Fonctionne sur tout le document ou sur une sélection.

### Crazy Detacher
Détache tous les composants qui ne proviennent pas des librairies **Spark Design System** ou **LBC Iconography** sur la page courante. Utile pour nettoyer rapidement un fichier avant une migration.

---

## Contribuer

Le plugin est développé en [Preact](https://preactjs.com/) + TypeScript.

### Prérequis

- [Node.js](https://nodejs.org/) 18+
- Figma Desktop (obligatoire pour tester un plugin en développement)

### Installation

```bash
npm install
```

### Lancer le plugin en développement

```bash
npm run watch
```

Le plugin se recompile automatiquement à chaque sauvegarde. Pour le charger dans Figma :

1. Ouvrir **Figma Desktop**
2. Menu **Plugins › Développement › Importer le plugin depuis le manifest…**
3. Sélectionner le fichier `manifest.json` à la racine du projet

Toute modification de fichier est visible immédiatement après avoir rechargé le plugin dans Figma (clic droit sur le canvas › Plugins › Development › Unify).

### Build

```bash
npm run build
```

---

## Structure du projet

```
src/
  plugin/   — logique côté Figma (accès à l'API Figma, scan, modifications)
  ui/       — interface du plugin (composants Preact, styles CSS, assets)
```

Les deux parties communiquent via `postMessage` — c'est la contrainte de l'architecture plugin Figma.
