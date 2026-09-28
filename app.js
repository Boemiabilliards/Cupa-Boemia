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


  groupSelect.addEventListener(
    "change",
    populatePlayers
  );


  populatePlayers();


  // ====================================================
  // SALVARE REZULTAT
  // ====================================================

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const discipline =
        disciplineSelect.value;

      const group =
        groupSelect.value;

      const player1 =
        player1Select.value;

      const player2 =
        player2Select.value;

      const score1 =
        Number(score1Input.value);

      const score2 =
        Number(score2Input.value);


      if (!discipline) {

        message.textContent =
          "Alege disciplina.";

        return;
      }


      if (!group) {

        message.textContent =
          "Alege grupa.";

        return;
      }


      if (!player1 || !player2) {

        message.textContent =
          "Alege ambii jucători.";

        return;
      }


      if (player1 === player2) {

        message.textContent =
          "Un jucător nu poate juca împotriva lui însuși.";

        return;
      }


      if (
        score1 < 0 ||
        score1 > 6 ||
        score2 < 0 ||
        score2 > 6
      ) {

        message.textContent =
          "Scorul trebuie să fie între 0 și 6.";

        return;
      }


      if (score1 === score2) {

        message.textContent =
          "Un meci nu poate fi egal.";

        return;
      }


      if (
        score1 !== 6 &&
        score2 !== 6
      ) {

        message.textContent =
          "Unul dintre jucători trebuie să aibă 6.";

        return;
      }


      message.textContent =
        "Se salvează...";


      const { error } =
        await db
          .from("matches")
          .insert({
            discipline: discipline,
            group_name: group,
            player1: player1,
            player2: player2,
            score1: score1,
            score2: score2
          });


      if (error) {

        console.error(error);

        message.textContent =
          "Eroare la salvare: " +
          error.message;

        return;
      }


      message.textContent =
        `Rezultat salvat: ${player1} ${score1}–${score2} ${player2} (${disciplineName()})`;


      score1Input.value = "";
      score2Input.value = "";


      await loadMatches();

    }
  );

}


// ======================================================
// ÎNCĂRCARE MECIURI
// ======================================================

async function loadMatches() {

  const { data, error } =
    await db
      .from("matches")
      .select("*")
      .eq("discipline", DISCIPLINE)
      .order("created_at", {
        ascending: false
      });


  if (error) {

    console.error(
      "Eroare la încărcarea meciurilor:",
      error
    );

    renderGroups([]);

    renderRecent([]);

    renderPlayoff([]);

    renderTop8([]);

    return;
  }


  window.allMatches =
    data || [];


  renderGroups(
    window.allMatches
  );

  renderRecent(
    window.allMatches
  );

  renderPlayoff(
    window.allMatches
  );

  renderTop8(
    window.allMatches
  );

}


// ======================================================
// CLASAMENT
// ======================================================

function getStandings(
  group,
  matches
) {

  const players =
    GROUPS[group] || [];


  const standings =
    players.map(player => ({

      player: player,

      played: 0,

      wins: 0,

      losses: 0,

      points: 0,

      racksWon: 0,

      racksLost: 0,

      diff: 0

    }));


  matches
    .
