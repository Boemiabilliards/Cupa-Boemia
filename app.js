const SUPABASE_URL = "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1ZGYycyIsInN1cCI6Imh1eGZ2c2pmZ2tidnpuY2dxanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTgzMzEsImV4cCI6MjEwNjE3NDMzMX0.knPPY953lVXXlmQWMx4Q_URR2YTnb-6o5F34_KiBTx8";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =====================================================
// GRUPELE TURNEULUI
// =====================================================

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


// =====================================================
// DETECTARE PAGINĂ
// =====================================================

const IS_ADMIN =
  !!document.getElementById("scoreForm");


// =====================================================
// DISCIPLINA PAGINII PUBLICE
// =====================================================

const PAGE_DISCIPLINE =
  document.body.dataset.discipline || null;


// =====================================================
// NUME DISCIPLINĂ
// =====================================================

function disciplineName(discipline) {

  if (discipline === "8ball") {
    return "8-BALL";
  }

  if (discipline === "9ball") {
    return "9-BALL";
  }

  return discipline || "";

}


// =====================================================
// CLASAMENT
// =====================================================

function getStandings(group, matches) {

  const rows =
    (GROUPS[group] || []).map(player => ({

      player: player,
      played: 0,
      wins: 0,
      losses: 0,
      points: 0,
      racksWon: 0,
      racksLost: 0,
      diff: 0

    }));


  (matches || [])
    .filter(m => m.group_name === group)
    .forEach(m => {

      const p1 =
        rows.find(x => x.player === m.player1);

      const p2 =
        rows.find(x => x.player === m.player2);


      if (!p1 || !p2) {
        return;
      }


      const s1 =
        Number(m.score1) || 0;

      const s2 =
        Number(m.score2) || 0;


      p1.played++;
      p2.played++;


      p1.racksWon += s1;
      p1.racksLost += s2;

      p2.racksWon += s2;
      p2.racksLost += s1;


      if (s1 > s2) {

        p1.wins++;
        p2.losses++;
        p1.points += 2;

      }

      else if (s2 > s1) {

        p2.wins++;
        p1.losses++;
        p2.points += 2;

      }

    });


  rows.forEach(x => {

    x.diff =
      x.racksWon - x.racksLost;

  });


  rows.sort((a, b) =>

    b.points - a.points ||
    b.wins - a.wins ||
    b.diff - a.diff ||
    b.racksWon - a.racksWon ||
    a.player.localeCompare(
      b.player,
      "ro"
    )

  );


  return rows;

}


// =====================================================
// AFIȘARE GRUPE
// =====================================================

function renderGroups(matches = []) {

  const container =
    document.getElementById(
      "groupsContainer"
    );


  if (!container) {
    return;
  }


  container.innerHTML =

    Object.keys(GROUPS).map(group => {

      const rows =
        getStandings(
          group,
          matches
        );


      return `

        <div class="group-card">

          <div class="group-title">

            <span>
              GRUPA ${group}
            </span>

            <small>
              ${disciplineName(PAGE_DISCIPLINE)}
            </small>

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

                ${rows.map((p, i) => `

                  <tr>

                    <td>
                      ${i + 1}
                    </td>


                    <td>

                      <strong>
                        ${escapeHtml(
                          p.player
                        )}
                      </strong>

                    </td>


                    <td>
                      ${p.played}
                    </td>


                    <td>
                      ${p.wins}
                    </td>


                    <td>
                      ${p.losses}
                    </td>


                    <td>

                      ${
                        p.diff > 0
                          ? "+"
                          : ""
                      }${p.diff}

                    </td>


                    <td>

                      <strong>
                        ${p.points}
                      </strong>

                    </td>

                  </tr>

                `).join("")}

              </tbody>

            </table>

          </div>

        </div>

      `;

    }).join("");

}


// =====================================================
// CALIFICAȚI
// =====================================================

function getQualifiedPlayers(matches = []) {

  const qualified = [];


  // GRUPA A
  // Locurile 1 și 2

  const groupA =
    getStandings(
      "A",
      matches
    );


  qualified.push(
    groupA[0]?.player || null
  );

  qualified.push(
    groupA[1]?.player || null
  );


  // GRUPELE B-E
  // Locul 1

  ["B", "C", "D", "E"]
    .forEach(group => {

      const standings =
        getStandings(
          group,
          matches
        );


      qualified.push(
        standings[0]?.player || null
      );

    });


  while (qualified.length < 8) {

    qualified.push(null);

  }


  return qualified.slice(0, 8);

}


// =====================================================
// PLAYOFF
// =====================================================

function renderPlayoff(matches = []) {

  const container =
    document.getElementById(
      "playoffBracket"
    );


  if (!container) {
    return;
  }


  const qualified =
    getQualifiedPlayers(
      matches
    );


  container.innerHTML = `

    <div class="bracket-round">

      <h3>
        PLAYOFF — 8 JUCĂTORI
      </h3>


      ${qualified.map((player, index) => `

        <div class="bracket-match">

          <span>
            ${index + 1}
          </span>


          <strong>

            ${
              player
                ? escapeHtml(player)
                : "În așteptare"
            }

          </strong>

        </div>

      `).join("")}

    </div>

  `;

}


// =====================================================
// TOP 8
// =====================================================

function renderTop8(matches = []) {

  const container =
    document.getElementById(
      "top8Bracket"
    );


  if (!container) {
    return;
  }


  const qualified =
    getQualifiedPlayers(
      matches
    );


  container.innerHTML = `

    <div class="bracket-round">

      <h3>
        TOP 8 — ${disciplineName(PAGE_DISCIPLINE)}
      </h3>


      ${qualified.map((player, index) => `

        <div class="bracket-match">

          <span>
            ${index + 1}
          </span>


          <strong>

            ${
              player
                ? escapeHtml(player)
                : "În așteptare"
            }

          </strong>

        </div>

      `).join("")}

    </div>

  `;

}


// =====================================================
// MECIURI RECENTE
// =====================================================

function renderRecent(matches = []) {

  const container =
    document.getElementById(
      "recentMatches"
    );


  if (!container) {
    return;
  }


  if (!matches.length) {

    container.innerHTML =
      "<p>Nu există încă rezultate.</p>";

    return;

  }


  container.innerHTML =

    matches
      .slice(0, 30)
      .map(m => `

        <div class="match-item">

          <div>

            <small>

              ${
                IS_ADMIN
                  ? `<strong>${escapeHtml(
                      disciplineName(m.discipline)
                    )}</strong> • `
                  : ""
              }

              Grupa
              ${escapeHtml(
                m.group_name || ""
              )}

            </small>


            <strong>

              ${escapeHtml(
                m.player1 || ""
              )}

            </strong>


            <span>
              vs
            </span>


            <strong>

              ${escapeHtml(
                m.player2 || ""
              )}

            </strong>

          </div>


          <div class="match-score">

            ${Number(m.score1)}
            –
            ${Number(m.score2)}

          </div>

        </div>

      `)
      .join("");

}


// =====================================================
// ÎNCĂRCARE MECIURI DIN SUPABASE
// =====================================================

async function loadMatches() {

  renderGroups([]);
  renderPlayoff([]);
  renderTop8([]);
  renderRecent([]);


  try {

    let query =
      db
        .from("matches")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    // -------------------------------------------------
    // PAGINI PUBLICE
    // -------------------------------------------------

    if (!IS_ADMIN) {

      query =
        query.eq(
          "discipline",
          PAGE_DISCIPLINE
        );

    }


    // -------------------------------------------------
    // ADMIN
    // -------------------------------------------------

    // Admin-ul vede ambele discipline.


    const {
      data,
      error
    } = await query;


    if (error) {
      throw error;
    }


    window.allMatches =
      data || [];


    // -------------------------------------------------
    // PAGINI PUBLICE
    // -------------------------------------------------

    if (!IS_ADMIN) {

      renderGroups(
        window.allMatches
      );

      renderPlayoff(
        window.allMatches
      );

      renderTop8(
        window.allMatches
      );

    }


    // -------------------------------------------------
    // ADMIN
    // -------------------------------------------------

    renderRecent(
      window.allMatches
    );


  } catch (error) {

    console.error(
      "Eroare la încărcarea meciurilor:",
      error
    );


    const message =
      document.getElementById(
        "scoreMessage"
      );


    if (message) {

      message.textContent =
        "Eroare la încărcarea rezultatelor: " +
        error.message;

    }

  }

}


// =====================================================
// FORMULAR SCOR
// =====================================================

function setupScoreForm() {

  const form =
    document.getElementById(
      "scoreForm"
    );


  if (!form) {
    return;
  }


  const disciplineSelect =
    document.getElementById(
      "scoreDiscipline"
    );

  const groupSelect =
    document.getElementById(
      "scoreGroup"
    );

  const player1 =
    document.getElementById(
      "scorePlayer1"
    );

  const player2 =
    document.getElementById(
      "scorePlayer2"
    );

  const score1 =
    document.getElementById(
      "score1"
    );

  const score2 =
    document.getElementById(
      "score2"
    );

  const message =
    document.getElementById(
      "scoreMessage"
    );


  // =========================================
  // POPULARE JUCĂTORI
  // =========================================

  function populatePlayers() {

    const group =
      groupSelect.value;


    const players =
      GROUPS[group] || [];


    const options =
      players.map(player => `

        <option
          value="${escapeAttr(player)}"
        >

          ${escapeHtml(player)}

        </option>

      `).join("");


    player1.innerHTML =

      '<option value="">Alege jucătorul</option>' +
      options;


    player2.innerHTML =

      '<option value="">Alege jucătorul</option>' +
      options;

  }


  groupSelect.addEventListener(
    "change",
    populatePlayers
  );


  populatePlayers();


  // =========================================
  // SCHIMBARE DISCIPLINĂ
  // =========================================

  disciplineSelect.addEventListener(
    "change",
    () => {

      message.textContent =

        `Disciplina selectată: ${disciplineName(
          disciplineSelect.value
        )}`;

    }
  );


  // =========================================
  // SALVARE REZULTAT
  // =========================================

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const discipline =
        disciplineSelect.value;

      const group =
        groupSelect.value;

      const p1 =
        player1.value;

      const p2 =
        player2.value;

      const s1 =
        Number(score1.value);

      const s2 =
        Number(score2.value);


      // =====================================
      // VALIDĂRI
      // =====================================

      if (
        discipline !== "8ball" &&
        discipline !== "9ball"
      ) {

        message.textContent =
          "Alege disciplina.";

        return;

      }


      if (
        !group ||
        !GROUPS[group]
      ) {

        message.textContent =
          "Alege grupa.";

        return;

      }


      if (!p1 || !p2) {

        message.textContent =
          "Alege ambii jucători.";

        return;

      }


      if (p1 === p2) {

        message.textContent =
          "Alege doi jucători diferiți.";

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

        return;

      }


      if (s1 === s2) {

        message.textContent =
          "Un meci nu poate fi egal.";

        return;

      }


      if (
        s1 !== 6 &&
        s2 !== 6
      ) {

        message.textContent =
          "Unul dintre jucători trebuie să aibă 6.";

        return;

      }


      message.textContent =
        `Verific ${disciplineName(
          discipline
        )}...`;


      // =====================================
      // VERIFICARE DUPLICAT
      // =====================================

      let existing;

      try {

        existing = await Promise.race([

          db
            .from("matches")
            .select(
              "discipline, group_name, player1, player2, score1, score2"
            )
            .eq(
              "discipline",
              discipline
            )
            .eq(
              "group_name",
              group
            ),

          new Promise((_, reject) =>

            setTimeout(

              () =>
                reject(
                  new Error(
                    "Supabase nu a răspuns la verificarea duplicatului în 10 secunde."
                  )
                ),

              10000

            )

          )

        ]);

      } catch (err) {

        console.error(err);

        message.textContent =
          "EROARE: " +
          err.message;

        return;

      }


      if (existing.error) {

        console.error(
          existing.error
        );

       