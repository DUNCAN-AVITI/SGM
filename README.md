
# Smart Grocery Manager

Une application web moderne et épurée pour gérer vos achats alimentaires, suivre votre budget et analyser vos habitudes de consommation.

## 🔗 Liens

- **Application** : `https://smart-grocery-manager-blue.vercel.app/`
- **GitHub** : `https://github.com/DUNCAN-AVITI/SGM`

## 🚀 Fonctionnalités

- **Gestion des achats** : Ajouter, modifier et supprimer des articles.
- **Analyse Top Produit** : Algorithme intelligent pour identifier vos produits favoris.
- **Tableau de bord financier** : Vue d'ensemble des dépenses par catégorie et montant total.
- **Filtres avancés** : Recherche par nom ou filtrage par date.
- **Persistance locale** : Vos données sont sauvegardées automatiquement dans votre navigateur.

## 🛠️ Installation

1. Clonez le dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez l'application en mode développement :
   ```bash
   npm start
   ```

## 🧪 Tests Unitaires

L'application inclut une suite de tests pour valider la logique métier, notamment la fonction `getTopProduct`.

Pour lancer les tests :
```bash
npm run test
```

*Note : Un bouton de test interactif est également disponible en bas à droite de l'interface utilisateur pour valider visuellement la logique en temps réel.*

## 📁 Structure du projet

- `App.tsx` : Coeur de l'application et gestion de l'état.
- `components/` : Composants UI réutilisables.
- `utils/analytics.ts` : Fonctions de calcul (Total, Top Produit).
- `data/achats.json` : Structure initiale des données.
- `tests/` : Suite de tests Vitest/Jest.

## 🎨 Design

- **Couleurs** : Blanc immaculé, Indigo moderne, Gris doux.
- **Typographie** : Inter (sans-serif).
- **Framework** : Tailwind CSS.
