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


// =========================
// GRUPE
// =========================

document.querySelector("#groups").innerHTML =
  Object.entries(groups).map(([g, players]) => `
    <article class="group">

      <div class="group-title">
        <b>Grupa ${g}</b>
        <span>${players.length} jucători • Round-robin</span>
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

          ${players.map((player, index) => `
            <tr>

              <td>
                <span class="rank">${index + 1}</span>
                <span class="player">${player}</span>
              </td>

              <td>0</td>
              <td>0</td>
              <td>0</td>

              <td>
                ${
                  index < 2 && g === "A"
                    ? '<span class="qual">—</span>'
                    : index === 0 && g !== "A"
                      ? '<span class="qual">→</span>'
                      : "0"
                }
              </td>

            </tr>
          `).join("")}

        </tbody>

      </table>

    </article>
  `).join("");


// =========================
// MECI
// =========================

function match(player1, player2) {

  return `
    <div class="match">

      <div class="row">
        <span>${player1}</span>
        <span class="score"></span>
      </div>

      <div class="row">
        <span>${player2}</span>
        <span class="score"></span>
      </div>

    </div>
  `;
}


// =========================
// PLAYOFF
// =========================

const playoff = [

  [
    ["B2", "C3"],
    ["C2", "D3"],
    ["D2", "E3"],
    ["E2", "B3"]
  ],

  [
    ["Câștigător 1", "Câștigător 2"],
    ["Câștigător 3", "Câștigător 4"]
  ],

  [
    ["Câștigător SF1", "Câștigător SF2"]
  ]

];


document.querySelector("#playoffBracket").innerHTML =

  playoff.map((round, index) => `

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

      ${round.map(game =>
        match(game[0], game[1])
      ).join("")}

    </div>

  `).join("");


// =========================
// TOP 8
// =========================

const top8 = [

  [
    ["Calificat direct 1", "Câștigător playoff"],
    ["Calificat direct 4", "Calificat direct 5"]
  ],

  [
    ["Câștigător QF1", "Câștigător QF2"],
    ["Calificat direct 2", "Calificat direct 3"]
  ],

  [
    ["Finalist 1", "Finalist 2"]
  ]

];


document.querySelector("#top8Bracket").innerHTML =

  top8.map((round, index) => `

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

      ${round.map(game =>
        match(game[0], game[1])
      ).join("")}

    </div>

  `).join("");


// =========================
// MECIURI RECENTE
// =========================

const recent = [
  ["—", "—"],
  ["—", "—"],
  ["—", "—"]
];


document.querySelector("#recentMatches").innerHTML =

  recent.map(game => `

    <div class="match-card">

      <div>
        <b>${game[0]}</b>
        <small> vs </small>
        <b>${game[1]}</b>
      </div>

      <div class="score">
        —
      </div>

    </div>

  `).join("");
