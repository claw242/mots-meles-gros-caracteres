# Générateur de mots mêlés en gros caractères (gratuit, à imprimer)

Outil gratuit de **Loupe & Lettres** — créé avec l'aide de l'IA (code et textes rédigés par un assistant IA).

Tapez vos mots, choisissez la taille de la grille (10 x 10 à 15 x 15) et le niveau, puis imprimez une grille de mots mêlés **en gros caractères** (lettres de 20 points) avec sa **solution** sur une seconde page, en A4. Tout se passe dans le navigateur : rien n'est envoyé, rien n'est enregistré, pas de cookie, pas d'inscription.

## Utiliser l'outil en ligne

https://outil-mots-meles.atelier-4efd18.workers.dev/

## Ce que fait l'outil

- 3 niveaux : facile (vers la droite ou vers le bas), moyen (avec les diagonales), difficile (avec les mots à l'envers).
- 3 thèmes prêts à l'emploi de 12 mots : Noël, jardin, cuisine.
- Un numéro de grille : mêmes mots, même taille, même niveau, même numéro = toujours la même grille.
- Accents, espaces, tirets et apostrophes retirés dans la grille : « Étoile » devient ETOILE.
- Les lettres de remplissage ne forment aucun mot grossier ni doublon d'un mot de la liste.
- Limite connue : si un mot de la liste contient un autre mot de la liste (par exemple POIRE et POIREAU), le petit mot apparaît aussi dans le grand.

## Pour les seniors et les grands-parents

Les mots mêlés en gros caractères sont pensés pour une lecture sans effort : grandes lettres, bon contraste, une grille par page. Cet outil gratuit sert à fabriquer une grille avec les mots de la famille, d'un thème ou d'une fête.

## Envie de grilles toutes prêtes ?

- **30 grilles de mots mêlés en gros caractères, fichier Word à imprimer** : https://loupeetlettres.gumroad.com/l/hnkbgz
- Boutique Loupe & Lettres : https://loupeetlettres.gumroad.com/

## Lancer les fichiers en local (serveur local)

La page charge un module JavaScript : l'ouvrir directement depuis le disque (`file://`) est bloqué par les navigateurs. Lancez un petit serveur local dans le dossier, par exemple `python3 -m http.server 8000`, puis ouvrez http://localhost:8000/ . Le plus simple reste l'outil en ligne ci-dessus. Aucune dépendance à installer.

## Licence

Voir `LICENSE.txt` : le code est libre d'usage (licence MIT). Les grilles que vous créez vous appartiennent.

---
Loupe & Lettres — créé avec l'aide de l'IA.
