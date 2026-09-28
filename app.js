// ======================================================
// CUPA BOEMIA — APP.JS
// 9-BALL + 8-BALL
// ======================================================


// ------------------------------------------------------
// SUPABASE
// ------------------------------------------------------

const SUPABASE_URL = "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_mVu4zRZY5-7Ay7n7Uqk1A_4BRk_AgA";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ------------------------------------------------------
// JUCĂTORI
// ------------------------------------------------------

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


// ------------------------------------------------------
// DISCIPLINA
// ------------------------------------------------------

// Dacă pagina are:
// <body data-discipline="8ball">
// atunci afișează 8-Ball.
//
// Dacă nu există atributul, folosim 9-Ball.

const DISCIPLINE =
  document.body.dataset.discipline || "9ball";


// ------------------------------------------------------
// NUME DISCIPLINĂ
// ------------------------------------------------------

function disciplineName() {

  if (DISCIPLINE === "8ball") {
    return "8-BALL";
  }

  return "9-BALL";
}


// ------------------------------------------------------
// FORMULAR ADMIN
// ------------------------------------------------------

function setupScoreForm() {

  const form = document.getElementById("scoreForm");

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


  // ----------------------------------------------------
  // GRUPE
  // ----------------------------------------------------

  groupSelect.addEventListener("change", () => {

    const group = groupSelect.value;

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

      option1.value = player;
      option1.textContent = player;

      player1Select.appendChild(option1);


      const option2 =
        document.createElement("option");

      option2.value = player;
      option2.textContent = player;

      player2Select.appendChild(option2);

    });

  });


  // ----------------------------------------------------
  // SALVARE REZULTAT
  // ----------------------------------------------------

  form.addEventListener("submit", async event => {

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


    // -----------------------------------------------
    // VALIDĂRI
    // -----------------------------------------------

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


    if (score1 !== 6 && score2 !== 6) {

      message.textContent =
        "Unul dintre jucători trebuie să aibă 6.";

      return;
    }


    // -----------------------------------------------
    // SALVARE ÎN SUPABASE
    // -----------------------------------------------

    message.textContent =
      "Se salvează...";


    const { error } = await db
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
        "Eroare la salvare: " + error.message;

      return;
    }


    message.textContent =
      `Rezultat salvat: ${player1} ${score1}–${score2} ${player2} (${disciplineName()})`;


    // resetăm scorurile

    score1Input.value = "";
    score2Input.value = "";


    // reîncărcăm rezultatele

    await loadMatches();

  });

}


// ------------------------------------------------------
// ÎNCARCĂ MECIURILE
// ------------------------------------------------------

async function loadMatches() {

  const { data, error } = await db
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

    return;
  }


  window.allMatches = data || [];


  renderGroups(window.allMatches);

  renderRecent(window.allMatches);

  renderPlayoff(window.allMatches);

  renderTop8(window.allMatches);
}


// ------------------------------------------------------
// CLASAMENT
// ------------------------------------------------------

function getStandings(group, matches) {

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

      racksLost: 0

    }));


  matches
    .filter(match =>
      match.group_name === group
    )
    .forEach(match => {

      const p1 =
        standings.find(
          item => item.player === match.player1
        );

      const p2 =
        standings.find(
          item => item.player === match.player2
        );


      if (!p1 || !p2) {
        return;
      }


      p1.played++;
      p2.played++;


      p1.racksWon += match.score1;
      p1.racksLost += match.score2;

      p2.racksWon += match.score2;
      p2.racksLost += match.score1;


      if (match.score1 > match.score2) {

        p1.wins++;
        p2.losses++;

        p1.points += 2;

      } else {

        p2.wins++;
        p1.losses++;

        p2.points += 2;

      }

    });


  standings.forEach(player => {

    player.diff =
      player.racksWon -
      player.racksLost;

  });


  // ----------------------------------------------------
  // ORDINE CLASAMENT
  // ----------------------------------------------------

  standings.sort((a, b) => {

    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    return b.diff - a.diff;

  });


  return standings;
}


// ------------------------------------------------------
// AFIȘARE GRUPE
// ------------------------------------------------------

function renderGroups(matches) {

  const container =
    document.getElementById("groupsContainer");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  Object.keys(GROUPS).forEach(group => {

    const standings =
      getStandings(group, matches);


    const card =
      document.createElement("div");

    card.className =
      "group-card";


    let html = `

      <div class="group-title">

        <span>GRUPA ${group}</span>

        <small>${disciplineName()}</small>

      </div>

      <div class="table-wrap">

        <table>

          <thead>

            <tr>

              <th>#</th>

              <th>Jucător</th>

              <th>M</th>

              <th>V</th>

              <th>Î</th>

              <th>Dif.</th>

              <th>Pts</th>

            </tr>

          </thead>

          <tbody>
    `;


    standings.forEach((player, index) => {

      html += `

        <tr>

          <td>${index + 1}</td>

          <td>
            <strong>${player.player}</strong>
          </td>

          <td>${player.played}</td>

          <td>${player.wins}</td>

          <td>${player.losses}</td>

          <td>${player.diff}</td>

          <td>
            <strong>${player.points}</strong>
          </td>

        </tr>

      `;

    });


    html += `

          </tbody>

        </table>

      </div>

    `;


    card.innerHTML = html;


    container.appendChild(card);

  });

}


// ------------------------------------------------------
// REZULTATE RECENTE
// ------------------------------------------------------

function renderRecent(matches) {

  const container =
    document.getElementById("recentMatches");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!matches.length) {

    container.innerHTML =
      "<p>Nu există încă rezultate.</p>";

    return;
  }


  matches
    .slice(0, 20)
    .forEach(match => {

      const item =
        document.createElement("div");

      item.className =
        "match-item";


      item.innerHTML = `

        <div>

          <small>
            Grupa ${match.group_name}
          </small>

          <strong>
            ${match.player1}
          </strong>

          <span>vs</span>

          <strong>
            ${match.player2}
          </strong>

        </div>


        <div class="match-score">

          ${match.score1}
          –
          ${match.score2}

        </div>

      `;


      container.appendChild(item);

    });

}


// ------------------------------------------------------
// PLAYOFF
// ------------------------------------------------------

function renderPlayoff(matches) {

  const container =
    document.getElementById("playoffBracket");


  if (!container) {
    return;
  }


  const qualified =
    getQualifiedPlayers(matches);


  container.innerHTML = `

    <div class="bracket-round">

      <h3>PLAYOFF — 8 JUCĂTORI</h3>

      ${qualified.map((player, index) => `

        <div class="bracket-match">

          <span>${index + 1}</span>

          <strong>
            ${player || "În așteptare"}
          </strong>

        </div>

      `).join("")}

    </div>

  `;

}


// ------------------------------------------------------
// TOP 8
// ------------------------------------------------------

function renderTop8(matches) {

  const container =
    document.getElementById("top8Bracket");


  if (!container) {
    return;
  }


  const qualified =
    getQualifiedPlayers(matches);


  container.innerHTML = `

    <div class="bracket-round">

      <h3>TOP 8 — ${disciplineName()}</h3>

      ${qualified.map((player, index) => `

        <div class="bracket-match">

          <span>${index + 1}</span>

          <strong>
            ${player || "În așteptare"}
          </strong>

        </div>

      `).join("")}

    </div>

  `;

}


// ------------------------------------------------------
// CALIFICĂRI
// ------------------------------------------------------

function getQualifiedPlayers(matches) {

  const qualified = [];


  // ----------------------------------------------------
  // GRUPA A
  // Primii 2
  // ----------------------------------------------------

  const groupA =
    getStandings("A", matches);


  qualified.push(
    groupA[0]?.player || null
  );

  qualified.push(
    groupA[1]?.player || null
  );


  // ----------------------------------------------------
  // GRUPELE B-E
  // ----------------------------------------------------

  ["B", "C", "D", "E"]
    .forEach(group => {

      const standings =
        getStandings(group, matches);


      qualified.push(
        standings[0]?.player || null
      );

    });


  return qualified.slice(0, 8);
}


// ------------------------------------------------------
// START
// ------------------------------------------------------

setupScoreForm();

loadMatches();
