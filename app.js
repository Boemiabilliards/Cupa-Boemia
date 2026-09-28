const groups = {
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

const SUPABASE_URL =
  "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_mVu4zRZY5-7Ay7n7uUqk1A_4BRk_AgA";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let matches = [];


/* =========================
   FORMULAR SCOR
========================= */

function setupScoreForm() {
  const group = document.querySelector("#scoreGroup");
  const player1 = document.querySelector("#scorePlayer1");
  const player2 = document.querySelector("#scorePlayer2");

  if (!group) return;

  group.innerHTML = Object.keys(groups)
    .map(g => `<option value="${g}">Grupa ${g}</option>`)
    .join("");

  function updatePlayers() {
    const players = groups[group.value];

    player1.innerHTML = players
      .map(p => `<option value="${p}">${p}</option>`)
      .join("");

    player2.innerHTML = players
      .map((p, i) =>
        `<option value="${p}" ${i === 1 ? "selected" : ""}>${p}</option>`
      )
      .join("");
  }

  group.addEventListener("change", updatePlayers);

  updatePlayers();

  document
    .querySelector("#scoreForm")
    .addEventListener("submit", async event => {

      event.preventDefault();

      const message = document.querySelector("#scoreMessage");

      const groupName = group.value;
      const p1 = player1.value;
      const p2 = player2.value;

      const s1 = Number(
        document.querySelector("#score1").value
      );

      const s2 = Number(
        document.querySelector("#score2").value
      );

      if (p1 === p2) {
        message.textContent =
          "Alege doi jucători diferiți.";
        message.className = "score-message err";
        return;
      }

      if (
        !Number.isInteger(s1) ||
        !Number.isInteger(s2) ||
        s1 < 0 ||
        s2 < 0 ||
        s1 > 6 ||
        s2 > 6
      ) {
        message.textContent =
          "Scorul trebuie să fie între 0 și 6.";
        message.className = "score-message err";
        return;
      }

      if (
        s1 === s2 ||
        (s1 !== 6 && s2 !== 6)
      ) {
        message.textContent =
          "Scor invalid. Exemplu: 6–4 sau 6–5.";
        message.className = "score-message err";
        return;
      }

      message.textContent = "Se salvează...";
      message.className = "score-message";

      const { error } = await db
        .from("matches")
        .insert({
          group_name: groupName,
          player1: p1,
          player2: p2,
          score1: s1,
          score2: s2
        });

      if (error) {
        console.error(error);

        message.textContent =
          "Eroare la salvare. Verifică Supabase.";
        message.className =
          "score-message err";

        return;
      }

      message.textContent =
        "✓ Rezultatul a fost salvat!";

      message.className =
        "score-message ok";

      document.querySelector("#score1").value = "";
      document.querySelector("#score2").value = "";

      await loadMatches();
    });
}


/* =========================
   CLASAMENT
========================= */

function renderGroups() {

  const stats = {};

  Object.values(groups)
    .flat()
    .forEach(player => {
      stats[player] = {
        matches: 0,
        wins: 0,
        losses: 0,
        points: 0
      };
    });

  matches.forEach(match => {

    const p1 = stats[match.player1];
    const p2 = stats[match.player2];

    if (!p1 || !p2) return;

    p1.matches++;
    p2.matches++;

    if (match.score1 > match.score2) {

      p1.wins++;
      p2.losses++;
      p1.points++;

    } else {

      p2.wins++;
      p1.losses++;
      p2.points++;
    }
  });


  document.querySelector("#groups").innerHTML =
    Object.entries(groups)
      .map(([groupName, players]) => {

        const sortedPlayers = [...players].sort(
          (a, b) =>
            stats[b].points - stats[a].points ||
            stats[b].wins - stats[a].wins
        );

        return `
          <article class="group">

            <div class="group-title">
              <b>Grupa ${groupName}</b>
              <span>
                ${players.length} jucători • Round-robin
              </span>
            </div>

            <table class="table">

              <thead>
                <tr>
                  <th>Jucător</th>
                  <th>M</th>
                  <th>V</th>
                  <th>Î</th>
                  <th>Pts</th>
                </tr>
              </thead>

              <tbody>

                ${sortedPlayers.map((player, index) => {

                  const s = stats[player];

                  return `
                    <tr>

                      <td>
                        <span class="rank">
                          ${index + 1}
                        </span>

                        <span class="player">
                          ${player}
                        </span>
                      </td>

                      <td>${s.matches}</td>
                      <td>${s.wins}</td>
                      <td>${s.losses}</td>
                      <td>${s.points}</td>

                    </tr>
                  `;

                }).join("")}

              </tbody>

            </table>

          </article>
        `;

      })
      .join("");
}


/* =========================
   MECIURI RECENTE
========================= */

function renderRecent() {

  const recent =
    [...matches]
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .slice(0, 8);

  if (!recent.length) {

    document.querySelector(
      "#recentMatches"
    ).innerHTML = `
      <div class="match-card">
        <b>Niciun rezultat încă.</b>
      </div>
    `;

    return;
  }


  document.querySelector(
    "#recentMatches"
  ).innerHTML = recent
    .map(match => `
      <div class="match-card">

        <div>
          <b>${match.player1}</b>
          <small> vs </small>
          <b>${match.player2}</b>

          <small>
            • Grupa ${match.group_name}
          </small>
        </div>

        <div class="score">
          ${match.score1}–${match.score2}
        </div>

      </div>
    `)
    .join("");
}


/* =========================
   PLAYOFF
========================= */

function getStandings(groupName) {

  const players = groups[groupName];

  const stats = players.map(player => ({
    player,
    points: 0,
    wins: 0
  }));

  matches.forEach(match => {

    if (
      match.group_name !== groupName
    ) return;

    const p1 = stats.find(
      x => x.player === match.player1
    );

    const p2 = stats.find(
      x => x.player === match.player2
    );

    if (!p1 || !p2) return;

    if (match.score1 > match.score2) {
      p1.points++;
      p1.wins++;
    } else {
      p2.points++;
      p2.wins++;
    }
  });

  return stats.sort(
    (a, b) =>
      b.points - a.points ||
      b.wins - a.wins
  );
}


function renderPlayoff() {

  const standings = {};

  Object.keys(groups).forEach(group => {
    standings[group] =
      getStandings(group);
  });


  function player(group, position) {

    return (
      standings[group]?.[position - 1]
        ?.player ||
      `${group}${position}`
    );
  }


  const playoff = [

    [
      [
        player("B", 2),
        player("C", 3)
      ],

      [
        player("C", 2),
        player("D", 3)
      ],

      [
        player("D", 2),
        player("E", 3)
      ],

      [
        player("E", 2),
        player("B", 3)
      ]
    ],

    [
      [
        "Câștigător 1",
        "Câștigător 2"
      ],

      [
        "Câștigător 3",
        "Câștigător 4"
      ]
    ],

    [
      [
        "Câștigător SF1",
        "Câștigător SF2"
      ]
    ]

  ];


  document.querySelector(
    "#playoffBracket"
  ).innerHTML = playoff
    .map((round, index) => `

      <div class="round">

        <h3>
          ${
            [
              "SFERTURI • 8",
              "SEMIFINALE • 4",
              "FINALĂ PLAYOFF • 2"
            ][index]
          }
        </h3>

        ${
          round
            .map(game => `
              <div class="match">

                <div class="row">
                  <span>${game[0]}</span>
                  <span class="score"></span>
                </div>

                <div class="row">
                  <span>${game[1]}</span>
                  <span class="score"></span>
                </div>

              </div>
            `)
            .join("")
        }

      </div>

    `)
    .join("");
}


/* =========================
   TOP 8
========================= */

function renderTop8() {

  const top8 = [

    [
      [
        "Calificat direct 1",
        "Câștigător playoff"
      ],

      [
        "Calificat direct 4",
        "Calificat direct 5"
      ]
    ],

    [
      [
        "Câștigător QF1",
        "Câștigător QF2"
      ],

      [
        "Calificat direct 2",
        "Calificat direct 3"
      ]
    ],

    [
      [
        "Finalist 1",
        "Finalist 2"
      ]
    ]

  ];


  document.querySelector(
    "#top8Bracket"
  ).innerHTML = top8
    .map((round, index) => `

      <div class="round">

        <h3>
          ${
            [
              "SFERTURI",
              "SEMIFINALE",
              "FINALĂ"
            ][index]
          }
        </h3>

        ${
          round.map(game => `
            <div class="match">

              <div class="row">
                <span>${game[0]}</span>
                <span class="score"></span>
              </div>

              <div class="row">
                <span>${game[1]}</span>
                <span class="score"></span>
              </div>

            </div>
          `).join("")
        }

      </div>

    `)
    .join("");
}


/* =========================
   ÎNCĂRCARE DIN SUPABASE
========================= */

async function loadMatches() {

  const { data, error } =
    await db
      .from("matches")
      .select("*")
      .order(
        "created_at",
        { ascending: false }
      );

  if (error) {

    console.error(error);

    const message =
      document.querySelector(
        "#scoreMessage"
      );

    if (message) {
      message.textContent =
        "Nu pot accesa baza de date Supabase.";
      message.className =
        "score-message err";
    }

    return;
  }

  matches = data || [];

  renderGroups();
  renderRecent();
  renderPlayoff();
  renderTop8();
}


/* =========================
   START
========================= */

setupScoreForm();
loadMatches();
