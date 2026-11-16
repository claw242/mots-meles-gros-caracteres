// Générateur de mots mêlés — Loupe & Lettres (créé avec l'aide de l'IA).
// Tout se passe dans le navigateur : aucune donnée n'est envoyée ni conservée.

export const TAILLE_MIN = 10;
export const TAILLE_MAX = 15;
export const MOTS_MAX = 20;
export const LONGUEUR_MIN = 3;

export const NIVEAUX = {
  facile: { nom: "Facile", directions: [[0, 1], [1, 0]] },
  moyen: { nom: "Moyen", directions: [[0, 1], [1, 0], [1, 1], [-1, 1]] },
  difficile: {
    nom: "Difficile",
    directions: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]],
  },
};

const HUIT_DIRECTIONS = NIVEAUX.difficile.directions;

// 12 mots chacun, écrits pour cet outil.
export const THEMES = {
  noel: {
    nom: "Noël",
    mots: ["Sapin", "Guirlande", "Cadeau", "Traîneau", "Bougie", "Neige", "Étoile", "Cheminée", "Bûche", "Marron", "Lutin", "Veillée"],
  },
  jardin: {
    nom: "Jardin",
    mots: ["Arrosoir", "Tulipe", "Potager", "Râteau", "Semis", "Tomate", "Pelouse", "Bêche", "Rosier", "Compost", "Abeille", "Haie"],
  },
  cuisine: {
    nom: "Cuisine",
    mots: ["Casserole", "Spatule", "Fouet", "Marmite", "Tarte", "Four", "Balance", "Louche", "Gratin", "Zeste", "Torchon", "Poêle"],
  },
};

// Lettres de remplissage qui ne doivent jamais former ces mots.
export const MOTS_GROSSIERS = [
  "CON", "CUL", "PUTE", "MERDE", "SEXE", "BITE", "SALOPE", "CACA", "PIPI", "NIQUE", "FOUTRE",
  "CONNE", "CHIER", "PUTAIN", "ZOB", "BITES", "COUILLE", "BATARD", "SALAUD", "NAZI",
];

// Fréquences approximatives des lettres en français (pour un remplissage naturel).
const FREQUENCES = {
  A: 8, B: 1, C: 3, D: 4, E: 15, F: 1, G: 1, H: 1, I: 7, J: 1, K: 1, L: 6, M: 3,
  N: 7, O: 5, P: 3, Q: 1, R: 7, S: 8, T: 7, U: 6, V: 2, W: 1, X: 1, Y: 1, Z: 1,
};
const LETTRES_POIDS = Object.entries(FREQUENCES).flatMap(([l, n]) => Array(n).fill(l));

/** Majuscules sans accents ; E accent -> E, oe -> OE, c cedille -> C ; espaces, tirets et apostrophes retirés. */
export function normaliser(mot) {
  return String(mot)
    .replace(/œ/g, "oe").replace(/Œ/g, "OE")
    .replace(/æ/g, "ae").replace(/Æ/g, "AE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

/** Graine texte ou nombre -> entier 32 bits (même graine = même résultat). */
export function graineEnEntier(graine) {
  let h = 2166136261;
  for (const c of String(graine)) {
    h ^= c.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function creerAlea(graine) {
  let a = graineEnEntier(graine) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function melanger(liste, alea) {
  const copie = liste.slice();
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Nettoie la liste : normalise, retire doublons et mots trop courts ; message clair si un mot est trop long. */
export function preparerMots(motsBruts, taille) {
  const erreurs = [];
  const vus = new Set();
  const mots = [];
  for (const brut of motsBruts) {
    const original = String(brut).trim();
    if (!original) continue;
    const mot = normaliser(original);
    if (mot.length < LONGUEUR_MIN) {
      erreurs.push(`« ${original} » est trop court : il faut au moins ${LONGUEUR_MIN} lettres.`);
      continue;
    }
    if (mot.length > taille) {
      erreurs.push(`« ${original} » est trop long pour une grille de ${taille}\u00d7${taille} : ${mot.length} lettres pour ${taille} cases. Choisissez un mot plus court ou une grille plus grande.`);
      continue;
    }
    if (vus.has(mot)) continue;
    vus.add(mot);
    mots.push({ original, mot });
  }
  if (mots.length > MOTS_MAX) {
    erreurs.push(`Trop de mots : ${mots.length} pour un maximum de ${MOTS_MAX}.`);
  }
  if (!mots.length && !erreurs.length) erreurs.push("Ajoutez au moins un mot.");
  return { mots, erreurs };
}

function cheminsPossibles(grille, taille, mot, directions) {
  const chemins = [];
  for (const [dl, dc] of directions) {
    for (let l = 0; l < taille; l++) {
      for (let c = 0; c < taille; c++) {
        const lf = l + dl * (mot.length - 1);
        const cf = c + dc * (mot.length - 1);
        if (lf < 0 || lf >= taille || cf < 0 || cf >= taille) continue;
        let ok = true;
        let croisements = 0;
        for (let k = 0; k < mot.length; k++) {
          const cell = grille[l + dl * k][c + dc * k];
          if (cell === null) continue;
          if (cell !== mot[k]) { ok = false; break; }
          croisements++;
        }
        // Un mot entièrement recouvert par d'autres serait illisible : on l'écarte.
        if (ok && croisements < mot.length) chemins.push({ l, c, dl, dc, croisements });
      }
    }
  }
  return chemins;
}

function placerTous(mots, taille, directions, alea) {
  const grille = Array.from({ length: taille }, () => Array(taille).fill(null));
  const placements = [];
  for (const { original, mot } of mots) {
    const chemins = melanger(cheminsPossibles(grille, taille, mot, directions), alea);
    if (!chemins.length) return null;
    // Léger goût pour les croisements (grille plus dense) sans perdre le hasard.
    chemins.sort((a, b) => Math.min(b.croisements, 1) - Math.min(a.croisements, 1));
    const choix = chemins[Math.floor(alea() * Math.min(chemins.length, 12))];
    const cases = [];
    for (let k = 0; k < mot.length; k++) {
      const l = choix.l + choix.dl * k;
      const c = choix.c + choix.dc * k;
      grille[l][c] = mot[k];
      cases.push([l, c]);
    }
    placements.push({ mot, original, ligne: choix.l, colonne: choix.c, dl: choix.dl, dc: choix.dc, cases });
  }
  return { grille, placements };
}

/** Toutes les occurrences d'un mot (cases traversées) dans les directions données. */
export function occurrences(grille, mot, directions = HUIT_DIRECTIONS) {
  const taille = grille.length;
  const trouvees = [];
  for (const [dl, dc] of directions) {
    for (let l = 0; l < taille; l++) {
      for (let c = 0; c < taille; c++) {
        const lf = l + dl * (mot.length - 1);
        const cf = c + dc * (mot.length - 1);
        if (lf < 0 || lf >= taille || cf < 0 || cf >= taille) continue;
        let ok = true;
        for (let k = 0; k < mot.length; k++) {
          if (grille[l + dl * k][c + dc * k] !== mot[k]) { ok = false; break; }
        }
        if (ok) trouvees.push(Array.from({ length: mot.length }, (_, k) => [l + dl * k, c + dc * k]));
      }
    }
  }
  return trouvees;
}

function remplir(grille, placements, directions, alea) {
  const taille = grille.length;
  const posee = Array.from({ length: taille }, () => Array(taille).fill(false));
  for (const p of placements) for (const [l, c] of p.cases) posee[l][c] = true;
  const tirer = () => LETTRES_POIDS[Math.floor(alea() * LETTRES_POIDS.length)];
  for (let l = 0; l < taille; l++) for (let c = 0; c < taille; c++) if (!posee[l][c]) grille[l][c] = tirer();

  const cle = (l, c) => l * taille + c;
  for (let tour = 0; tour < 400; tour++) {
    const aRefaire = new Set();
    const surveiller = (mot, dirs, estCelleAttendue) => {
      for (const chemin of occurrences(grille, mot, dirs)) {
        if (estCelleAttendue(chemin)) continue;
        for (const [l, c] of chemin) if (!posee[l][c]) aRefaire.add(cle(l, c));
      }
    };
    for (const m of MOTS_GROSSIERS) surveiller(m, HUIT_DIRECTIONS, () => false);
    for (const p of placements) {
      const attendue = (chemin) => chemin.every(([l, c], k) => l === p.cases[k][0] && c === p.cases[k][1]);
      surveiller(p.mot, directions, attendue);
    }
    if (!aRefaire.size) return true;
    for (const k of aRefaire) grille[Math.floor(k / taille)][k % taille] = tirer();
  }
  return false;
}

/**
 * Génère une grille.
 * options : { mots: string[], taille: 10..15, niveau: facile|moyen|difficile, graine }
 * Retour : { ok:true, taille, niveau, graine, grille:string[][], solution:boolean[][], placements, mots:[{original,mot}] }
 *       ou { ok:false, erreurs:string[] }
 */
export function generer({ mots, taille = 12, niveau = "facile", graine = "1" }) {
  const n = Number(taille);
  if (!Number.isInteger(n) || n < TAILLE_MIN || n > TAILLE_MAX) {
    return { ok: false, erreurs: [`La taille doit être comprise entre ${TAILLE_MIN} et ${TAILLE_MAX}.`] };
  }
  const reglage = NIVEAUX[niveau];
  if (!reglage) return { ok: false, erreurs: ["Niveau inconnu : facile, moyen ou difficile."] };

  const { mots: propres, erreurs } = preparerMots(mots, n);
  if (erreurs.length) return { ok: false, erreurs };

  // Ordre indépendant de la saisie : les plus longs d'abord, puis l'ordre alphabétique.
  const ordonnes = propres.slice().sort((a, b) => b.mot.length - a.mot.length || a.mot.localeCompare(b.mot));

  for (let essai = 0; essai < 40; essai++) {
    const alea = creerAlea(`${graine}|${n}|${niveau}|${essai}`);
    const pose = placerTous(ordonnes, n, reglage.directions, alea);
    if (!pose) continue;
    if (!remplir(pose.grille, pose.placements, reglage.directions, alea)) continue;
    const solution = Array.from({ length: n }, () => Array(n).fill(false));
    for (const p of pose.placements) for (const [l, c] of p.cases) solution[l][c] = true;
    return { ok: true, taille: n, niveau, graine: String(graine), grille: pose.grille, solution, placements: pose.placements, mots: ordonnes };
  }
  return {
    ok: false,
    erreurs: ["Impossible de placer tous les mots dans cette grille. Essayez une grille plus grande, moins de mots ou des mots plus courts."],
  };
}

/**
 * Mise en page A4 de la feuille 1 : nombre de colonnes de la liste (lettres de 18 pt, largeur utile 186 mm)
 * et largeur de la grille en mm pour que grille + liste + pieds tiennent sur une seule page (272 mm utiles).
 * Estimation : une majuscule grasse de 18 pt ~ 5 mm ; une ligne de liste ~ 8,6 mm.
 */
export function miseEnPageListe(motsNormalises) {
  const plusLong = motsNormalises.reduce((m, w) => Math.max(m, w.length), 0);
  const colonnes = plusLong <= 8 ? 4 : plusLong <= 11 ? 3 : 2;
  const lignes = Math.ceil(motsNormalises.length / colonnes);
  const reserve = 14 + 15 + 8 + 6; // titre + « Mots à retrouver » + pied + marges
  const disponible = 272 - reserve - lignes * 8.6;
  const largeurGrilleMm = Math.round(Math.max(135, Math.min(186, disponible)));
  return { colonnes, largeurGrilleMm };
        }
