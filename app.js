// ======================================================
// CUPA BOEMIA — APP.JS
// 9-BALL + 8-BALL
// ======================================================

const SUPABASE_URL =
  "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_mVu4zRZY5-7Ay7n7Uqk1A_4BRk_AgA";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================================================
// JUCĂTORI
// ======================================================

const GROUPS = {
  A: [
    "Alexa Mihai",
    "Nicu Hoha",
    "Robert Laza",
    "Florut Adrian (Pietroi)",
    "Oprea Mihai",
    "Dragan Razvan",
    "Gicu Maier"
  ],

  B: [
    "Petri Ionut",
    "Daniel Gusețh",
    "Pop Andrei",
    "Iuga Darius",
    "Rus Ovidiu"
  ],

  C: [
    "Pop Calin",
    "Pagu Bogdan",
    "Gickonne",
    "Matei Morariu",
    "Liță Nicolae"
  ],

  D: [
    "Șimon Daniel",
    "Alex Rus",
    "Vali Ulise",
    "Cosmin Bizau",
    "Gigi Mari"
  ],

  E: [
    "Mare Sebastian",
    "Bugnar Mihai",
    "Paul Zaig",
    "Sergiu Moisa",
    "Gigi Ghile"
  ]
};


// ======================================================
// DISCIPLINA
// ======================================================

const DISCIPLINE =
  document.body.dataset.discipline || "9ball";


function disciplineName() {
  return DISCIPLINE === "8ball"
    ? "8-BALL"
    : "9-BALL";
}


// ======================================================
// FORMULAR ADMIN
// ======================================================

function setupScoreForm() {

  const form =
    document.getElementById("scoreForm");

  if (!form) {
    return;
  }

  const disciplineSelect =
    document.getElementById("scoreDiscipline");

  const groupSelect =
    document.getElementById("scoreGroup");

  const player1Select =
    document.getElementById("scorePlayer1");

  const player2Select =
    document.getElementById("scorePlayer2");

  const score1Input =
    document.getElementById("score1");

  const score2Input =
    document.getElementById("score2");

  const message =
    document.getElementById("scoreMessage");


  // ====================================================
  // POPULARE JUCĂTORI
  // ====================================================

  function populatePlayers() {

    const group =
      groupSelect.value;

    player1Select.innerHTML =
      '<option value="">Alege jucătorul</option>';

    player2Select.innerHTML =
      '<option value="">Alege jucătorul</option>';


    if (!group || !GROUPS[group]) {
      return;
    }


    GROUPS[group].forEach(player => {

      const option1 =
        document.createElement("option");

      option1.value =
        player;

      option1.textContent =
        player;

      player1Select.appendChild(
        option1
      );


      const option2 =
        document.createElement("option");

      option2.value =
        player;

      option2.textContent =
        player;

      player2Select.appendChild(
        option2
      );

    });

  }


  // Când schimbăm grupa
  groupSelect.addEventListener(
    "change",
    populatePlayers
  );


  // Populează jucătorii și
