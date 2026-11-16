// Interface du générateur : tout reste dans le navigateur, rien n'est envoyé ni conservé.
import { generer, THEMES, miseEnPageListe } from "./generateur.js";

const el = (id) => document.getElementById(id);
const formulaire = el("formulaire");
const zoneMessage = el("message");

function lireMots() {
  return el("mots").value.split(/[\n,;]+/).map((m) => m.trim()).filter(Boolean);
}

function afficherErreurs(erreurs) {
  zoneMessage.textContent = "";
  const ul = document.createElement("ul");
  for (const e of erreurs) {
    const li = document.createElement("li");
    li.textContent = e;
    ul.appendChild(li);
  }
  zoneMessage.appendChild(ul);
  zoneMessage.className = "erreur";
}

function dessiner(conteneur, resultat, avecSolution) {
  conteneur.textContent = "";
  conteneur.style.setProperty("--n", String(resultat.taille));
  resultat.grille.forEach((ligne, l) => {
    ligne.forEach((lettre, c) => {
      const cellule = document.createElement("span");
      cellule.className = "case" + (avecSolution && resultat.solution[l][c] ? " trouvee" : "");
      cellule.textContent = lettre;
      conteneur.appendChild(cellule);
    });
  });
}

function afficher(resultat) {
  dessiner(el("grille"), resultat, false);
  dessiner(el("grille-solution"), resultat, true);
  const liste = el("liste-mots");
  liste.textContent = "";
  for (const { mot } of resultat.mots.slice().sort((a, b) => a.mot.localeCompare(b.mot))) {
    const li = document.createElement("li");
    li.textContent = mot;
    liste.appendChild(li);
  }
  const mise = miseEnPageListe(resultat.mots.map((m) => m.mot));
  el("feuille-grille").style.setProperty("--colonnes", String(mise.colonnes));
  el("feuille-grille").style.setProperty("--grille-mm", mise.largeurGrilleMm + "mm");
  el("titre-feuille").textContent = `Mots mêlés — grille n° ${resultat.graine}`;
  el("titre-solution").textContent = `Solution — grille n° ${resultat.graine}`;
  el("vide").hidden = true;
  el("feuilles").hidden = false;
  el("imprimer").disabled = false;
  zoneMessage.textContent = `Grille ${resultat.taille} \u00d7 ${resultat.taille} créée avec ${resultat.mots.length} mots.`;
  zoneMessage.className = "ok";
}

function creer() {
  const resultat = generer({
    mots: lireMots(),
    taille: Number(el("taille").value),
    niveau: el("niveau").value,
    graine: el("graine").value.trim() || "1",
  });
  if (!resultat.ok) {
    el("imprimer").disabled = true;
    el("feuilles").hidden = true;
    el("vide").hidden = false;
    afficherErreurs(resultat.erreurs);
    return;
  }
  afficher(resultat);
}

el("theme").addEventListener("change", (e) => {
  const theme = THEMES[e.target.value];
  if (theme) el("mots").value = theme.mots.join("\n");
});
formulaire.addEventListener("submit", (e) => { e.preventDefault(); creer(); });
el("autre").addEventListener("click", () => {
  el("graine").value = String(Math.floor(Math.random() * 90000) + 10000);
  creer();
});
el("imprimer").addEventListener("click", () => window.print());
