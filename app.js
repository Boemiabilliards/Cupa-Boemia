const SUPABASE_URL =
  "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eGZ2c2pmZ2tidnpuY2dxanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTgzMzEsImV4cCI6MjEwNjE3NDMzMX0.knPPY953lVXXlmQWMx4Q_URR2YTnb-6o5F34_KiBTx8";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =====================================================
// GRUPE
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
// PAGINA
// =====================================================

const IS_ADMIN =
  !!document.getElementById("scoreForm");

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
// PROTECȚIE HTML
// =====================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, function(character) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];

    });

}


// =====================================================
// CLASAMENT
//
// VICTORIE = 1 PUNCT
//
// DEPARTAJARE:
// 1. PUNCTE
// 2. % RACK
// 3. DIFERENȚĂ RACK
// 4. RACK-URI CÂȘTIGATE
// 5. NUME
// =====================================================

function getStandings(group, matches = []) {

  const rows =
    (GROUPS[group] || []).map(function(player) {

      return {

        player: player,

        played: 0,

        wins: 0,

        losses: 0,

        points: 0,

        racksWon: 0,

        racksLost: 0,

        diff: 0,

        rackPercent: 0

      };

    });


  matches

    .filter(function(match) {

      return match.group_name === group;

    })

    .forEach(function(match) {

      const player1 =
        rows.find(function(row) {

          return row.player === match.player1;

        });


      const player2 =
        rows.find(function(row) {

          return row.player === match.player2;

        });


      if (!player1 || !player2) {
        return;
      }


      const score1 =
        Number(match.score1) || 0;

      const score2 =
        Number(match.score2) || 0;


      player1.played++;
      player2.played++;


      player1.racksWon += score1;
      player1.racksLost += score2;


      player2.racksWon += score2;
      player2.racksLost += score1;


      if (score1 > score2) {

        player1.wins++;
        player2.losses++;

        player1.points += 1;

      }

      else if (score2 > score1) {

        player2.wins++;
        player1.losses++;

        player2.points += 1;

      }

    });


  rows.forEach(function(row) {

    row.diff =
      row.racksWon -
      row.racksLost;


    const totalRacks =
      row.racksWon +
      row.racksLost;


    row.rackPercent =
      totalRacks > 0
        ? (row.racksWon / totalRacks) * 100
        : 0;

  });


  rows.sort(function(a, b) {

    // 1. PUNCTE
    if (b.points !== a.points) {
      return b.points - a.points;
    }


    // 2. PROCENT RACK
    if (b.rackPercent !== a.rackPercent) {
      return b.rackPercent - a.rackPercent;
    }


    // 3. DIFERENȚĂ RACK
    if (b.diff !== a.diff) {
      return b.diff - a.diff;
    }


    // 4. RACK-URI CÂȘTIGATE
    if (b.racksWon !== a.racksWon) {
      return b.racksWon - a.racksWon;
    }


    // 5. ALFABETIC
    return a.player.localeCompare(
      b.player,
      "ro"
    );

  });


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

    Object.keys(GROUPS)

      .map(function(group) {

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
                ${disciplineName(
                  PAGE_DISCIPLINE
                )}
              </small>

            </div>


            <div class="table-wrap">

              <table>

                <thead>

                  <tr>

                    <th>LOC</th>

                    <th>JUCĂTOR</th>

                    <th>M</th>

                    <th>V</th>

                    <th>Î</th>

                    <th>RACK +</th>

                    <th>RACK −</th>

                    <th>% RACK</th>

                    <th>DIF.</th>

                    <th>PTS</th>

                  </tr>

                </thead>


                <tbody>

                  ${rows.map(
                    function(player, index) {

                      const percent =
                        player.rackPercent
                          .toFixed(1) + "%";


                      const diff =
                        player.diff > 0
                          ? "+" + player.diff
                          : player.diff;


                      return `

                        <tr>

                          <td>
                            <strong>
                              ${index + 1}
                            </strong>
                          </td>


                          <td>

                            <strong>
                              ${escapeHtml(
                                player.player
                              )}
                            </strong>

                          </td>


                          <td>
                            ${player.played}
                          </td>


                          <td>
                            ${player.wins}
                          </td>


                          <td>
                            ${player.losses}
                          </td>


                          <td>
                            ${player.racksWon}
                          </td>


                          <td>
                            ${player.racksLost}
                          </td>


                          <td>

                            <strong>
                              ${percent}
                            </strong>

                          </td>


                          <td>
                            ${diff}
                          </td>


                          <td>

                            <strong>
                              ${player.points}
                            </strong>

                          </td>

                        </tr>

                      `;

                    }
                  ).join("")}

                </tbody>

              </table>

            </div>

          </div>

        `;

      })

      .join("");

}


// =====================================================
// CALIFICĂRI
//
// GRUPA A:
// LOCUL 1 + LOCUL 2 → TOP 8
//
// GRUPELE B-E:
// LOCUL 1 → TOP 8
// LOCURILE 2 + 3 → PLAYOFF
// =====================================================

function getQualifiedPlayers(matches = []) {

  const groupA =
    getStandings("A", matches);

  const groupB =
    getStandings("B", matches);

  const groupC =
    getStandings("C", matches);

  const groupD =
    getStandings("D", matches);

  const groupE =
    getStandings("E", matches);


  return {

    group1First:
      groupA[0]?.player || null,

    group1Second:
      groupA[1]?.player || null,


    group2First:
      groupB[0]?.player || null,

    group2Second:
      groupB[1]?.player || null,

    group2Third:
      groupB[2]?.player || null,


    group3First:
      groupC[0]?.player || null,

    group3Second:
      groupC[1]?.player || null,

    group3Third:
      groupC[2]?.player || null,


    group4First:
      groupD[0]?.player || null,

    group4Second:
      groupD[1]?.player || null,

    group4Third:
      groupD[2]?.player || null,


    group5First:
      groupE[0]?.player || null,

    group5Second:
      groupE[1]?.player || null,

    group5Third:
      groupE[2]?.player || null

  };

}


// =====================================================
// PLAYOFF
//
// M1: LOC 2 GRUPA B vs LOC 3 GRUPA C
// M2: LOC 2 GRUPA C vs LOC 3 GRUPA D
// M3: LOC 2 GRUPA D vs LOC 3 GRUPA E
// M4: LOC 2 GRUPA E vs LOC 3 GRUPA B
//
// SF1: M1 vs M3
// SF2: M2 vs M4
//
// FINALĂ: SF1 vs SF2
// =====================================================

function renderPlayoff(matches = []) {

  const container =
    document.getElementById(
      "playoffBracket"
    );


  if (!container) {
    return;
  }


  const q =
    getQualifiedPlayers(matches);


  function playerName(value) {

    return value
      ? escapeHtml(value)
      : "În așteptare";

  }


  container.innerHTML = `

    <div class="bracket-round">

      <h3>
        PLAYOFF — 8 JUCĂTORI
      </h3>


      <p style="
        margin-bottom:20px;
        opacity:.85;
      ">

        Locurile 2 și 3 din grupele 2–5.

        <br>

        Jucătorii din aceeași grupă
        nu se întâlnesc până în finala playoff-ului.

      </p>


      <h4>
        SFERTURI PLAYOFF — 8 → 4
      </h4>


      <div class="bracket-match">

        <span>M1</span>

        <strong>
          ${playerName(
            q.group2Second
          )}
        </strong>

        <span>VS</span>

        <strong>
          ${playerName(
            q.group3Third
          )}
        </strong>

      </div>


      <div class="bracket-match">

        <span>M2</span>

        <strong>
          ${playerName(
            q.group3Second
          )}
        </strong>

        <span>VS</span>

        <strong>
          ${playerName(
            q.group4Third
          )}
        </strong>

      </div>


      <div class="bracket-match">

        <span>M3</span>

        <strong>
          ${playerName(
            q.group4Second
          )}
        </strong>

        <span>VS</span>

        <strong>
          ${playerName(
            q.group5Third
          )}
        </strong>

      </div>


      <div class="bracket-match">

        <span>M4</span>

        <strong>
          ${playerName(
            q.group5Second
          )}
        </strong>

        <span>VS</span>

        <strong>
          ${playerName(
            q.group2Third
          )}
        </strong>

      </div>


      <h4 style="
        margin-top:30px;
      ">

        SEMIFINALE PLAYOFF — 4 → 2

      </h4>


      <div class="bracket-match">

        <span>SF1</span>

        <strong>
          Câștigător M1
        </strong>

        <span>VS</span>

        <strong>
          Câștigător M3
        </strong>

      </div>


      <div class="bracket-match">

        <span>SF2</span>

        <strong>
          Câștigător M2
        </strong>

        <span>VS</span>

        <strong>
          Câștigător M4
        </strong>

      </div>


      <h4 style="
        margin-top:30px;
      ">

        FINALA PLAYOFF

      </h4>


      <div class="bracket-match">

        <span>FINALĂ</span>

        <strong>
          Câștigător SF1
        </strong>

        <span>VS</span>

        <strong>
          Câștigător SF2
        </strong>

      </div>


      <p style="
        margin-top:20px;
        font-weight:700;
      ">

        🏆 Cei 2 câștigători ai playoff-ului
        se califică în TOP 8.

      </p>

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


  const q =
    getQualifiedPlayers(matches);


  function playerName(value) {

    return value
      ? escapeHtml(value)
      : "În așteptare";

  }


  container.innerHTML = `

    <div class="bracket-round">

      <h3>

        TOP 8 —
        ${disciplineName(
          PAGE_DISCIPLINE
        )}

      </h3>


      <p style="
        margin-bottom:20px;
        opacity:.85;
      ">

        Cei 8 jucători calificați.
        Tragerea la sorți pentru piramida finală
        se face după încheierea playoff-ului.

      </p>


      <div class="bracket-match">

        <span>1</span>

        <strong>
          ${playerName(
            q.group1First
          )}
        </strong>

        <span>
          Grupa 1 — Locul 1
        </span>

      </div>


      <div class="bracket-match">

        <span>2</span>

        <strong>
          ${playerName(
            q.group1Second
          )}
        </strong>

        <span>
          Grupa 1 — Locul 2
        </span>

      </div>


      <div class="bracket-match">

        <span>3</span>

        <strong>
          ${playerName(
            q.group2First
          )}
        </strong>

        <span>
          Grupa 2 — Locul 1
        </span>

      </div>


      <div class="bracket-match">

        <span>4</span>

        <strong>
          ${playerName(
            q.group3First
          )}
        </strong>

        <span>
          Grupa 3 — Locul 1
        </span>

      </div>


      <div class="bracket-match">

        <span>5</span>

        <strong>
          ${playerName(
            q.group4First
          )}
        </strong>

        <span>
          Grupa 4 — Locul 1
        </span>

      </div>


      <div class="bracket-match">

        <span>6</span>

        <strong>
          ${playerName(
            q.group5First
          )}
        </strong>

        <span>
          Grupa 5 — Locul 1
        </span>

      </div>


      <div class="bracket-match">

        <span>7</span>

        <strong>
          Câștigător Playoff 1
        </strong>

        <span>
          Calificat
        </span>

      </div>


      <div class="bracket-match">

        <span>8</span>

        <strong>
          Câștigător Playoff 2
        </strong>

        <span>
          Calificat
        </span>

      </div>


      <p style="
        margin-top:20px;
        font-weight:700;
      ">

        🎱 8 jucători →
        tragere la sorți →
        piramida finală.

      </p>

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

      .map(function(match) {

        return `

          <div class="match-item">

            <div>

              <small>

                ${
                  IS_ADMIN
                    ? `

                      <strong>
                        ${disciplineName(
                          match.discipline
                        )}
                      </strong>

                      •

                    `
                    : ""
                }

                Grupa
                ${escapeHtml(
                  match.group_name || ""
                )}

              </small>


              <strong>
                ${escapeHtml(
                  match.player1 || ""
                )}
              </strong>


              <span>
                vs
              </span>


              <strong>
                ${escapeHtml(
                  match.player2 || ""
                )}
              </strong>

            </div>


            <div class="match-score">

              ${Number(match.score1)}

              –

              ${Number(match.score2)}

            </div>

          </div>

        `;

      })

      .join("");

}


// =====================================================
// ADMIN — TOATE MECIURILE
// =====================================================

function renderAdminMatches(matches = []) {

  const container =
    document.getElementById(
      "allMatchesAdmin"
    );


  if (!container) {
    return;
  }


  const disciplineFilter =
    document.getElementById(
      "adminFilterDiscipline"
    )?.value || "";


  const groupFilter =
    document.getElementById(
      "adminFilterGroup"
    )?.value || "";


  const filtered =
    matches.filter(function(match) {

      return (

        (
          !disciplineFilter ||
          match.discipline ===
            disciplineFilter
        )

        &&

        (
          !groupFilter ||
          match.group_name ===
            groupFilter
        )

      );

    });


  if (!filtered.length) {

    container.innerHTML =
      "<p>Nu există meciuri pentru filtrul ales.</p>";

    return;

  }


  container.innerHTML =

    filtered

      .map(function(match) {

        return `

          <div
            class="match-item"
            style="
              align-items:center;
              gap:14px;
              flex-wrap:wrap;
            "
          >

            <div
              style="
                flex:1;
                min-width:220px;
              "
            >

              <small>

                <strong>
                  ${disciplineName(
                    match.discipline
                  )}
                </strong>

                •

                Grupa
                ${escapeHtml(
                  match.group_name || ""
                )}

              </small>


              <div style="
                margin-top:5px;
              ">

                <strong>
                  ${escapeHtml(
                    match.player1 || ""
                  )}
                </strong>

                <span>
                  vs
                </span>

                <strong>
                  ${escapeHtml(
                    match.player2 || ""
                  )}
                </strong>

              </div>

            </div>


            <div class="match-score">

              ${Number(match.score1)}
              –
              ${Number(match.score2)}

            </div>


            <div
              style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
              "
            >

              <button
                type="button"
                class="btn"
                data-edit-match="${escapeHtml(
                  match.id
                )}"
              >
                EDITARE
              </button>


              <button
                type="button"
                class="btn"
                data-delete-match="${escapeHtml(
                  match.id
                )}"
              >
                ȘTERGE
              </button>

            </div>

          </div>

        `;

      })

      .join("");

}


// =====================================================
// ÎNCĂRCARE MECIURI
//
// IMPORTANT:
// GRUPELE SE AFIȘEAZĂ ÎNAINTE DE SUPABASE.
// ASTFEL, DACĂ SUPABASE ARE O EROARE,
// JUCĂTORII RĂMÂN VIZIBILI.
// =====================================================

async function loadMatches() {

  // Afișăm imediat grupele cu toți jucătorii.
  if (!IS_ADMIN) {

    renderGroups([]);

    renderPlayoff([]);

    renderTop8([]);

  }


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


    if (
      !IS_ADMIN &&
      PAGE_DISCIPLINE
    ) {

      query =
        query.eq(
          "discipline",
          PAGE_DISCIPLINE
        );

    }


    const {
      data,
      error
    } = await query;


    if (error) {

      console.error(
        "Eroare Supabase:",
        error
      );


      // Jucătorii rămân afișați.
      if (!IS_ADMIN) {

        renderGroups([]);

        renderPlayoff([]);

        renderTop8([]);

      }

      return;

    }


    const matches =
      data || [];


    window.allMatches =
      matches;


    if (!IS_ADMIN) {

      renderGroups(
        matches
      );

      renderPlayoff(
        matches
      );

      renderTop8(
        matches
      );

    }


    renderRecent(
      matches
    );


    if (IS_ADMIN) {

      renderAdminMatches(
        matches
      );

    }

  }

  catch (error) {

    console.error(
      "Eroare la încărcarea meciurilor:",
      error
    );


    // Chiar dacă apare o eroare neașteptată,
    // grupele rămân afișate.
    if (!IS_ADMIN) {

      renderGroups([]);

      renderPlayoff([]);

      renderTop8([]);

    }

  }

}


// =====================================================
// FORMULAR ADMIN
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


  const player1Select =
    document.getElementById(
      "scorePlayer1"
    );


  const player2Select =
    document.getElementById(
      "scorePlayer2"
    );


  const score1Input =
    document.getElementById(
      "score1"
    );


  const score2Input =
    document.getElementById(
      "score2"
    );


  const message =
    document.getElementById(
      "scoreMessage"
    );


  function populatePlayers() {

    const group =
      groupSelect.value;


    const players =
      GROUPS[group] || [];


    const options =

      players

        .map(function(player) {

          return `

            <option
              value="${escapeHtml(
                player
              )}"
            >

              ${escapeHtml(
                player
              )}

            </option>

          `;

        })

        .join("");


    player1Select.innerHTML =

      `

        <option value="">
          Alege jucătorul
        </option>

      ` +

      options;


    player2Select.innerHTML =

      `

        <option value="">
          Alege jucătorul
        </option>

      ` +

      options;

  }


  groupSelect.addEventListener(
    "change",
    populatePlayers
  );


  populatePlayers();


  form.addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      if (
        form.dataset.saving ===
        "1"
      ) {

        return;

      }


      const discipline =
        disciplineSelect.value;


      const group =
        groupSelect.value;


      const player1 =
        player1Select.value;


      const player2 =
        player2Select.value;


      const score1 =
        Number(
          score1Input.value
        );


      const score2 =
        Number(
          score2Input.value
        );


      if (
        !discipline ||
        !group ||
        !player1 ||
        !player2
      ) {

        message.textContent =
          "Completează toate câmpurile.";

        return;

      }


      if (
        player1 ===
        player2
      ) {

        message.textContent =
          "Alege doi jucători diferiți.";

        return;

      }


      if (

        !Number.isInteger(score1)

        ||

        !Number.isInteger(score2)

        ||

        score1 < 0

        ||

        score2 < 0

        ||

        score1 > 6

        ||

        score2 > 6

      ) {

        message.textContent =
          "Scorul trebuie să fie între 0 și 6.";

        return;

      }


      if (
        score1 === score2
      ) {

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


      form.dataset.saving =
        "1";


      try {

        message.textContent =
          "Verific dacă meciul există deja...";


        const existing =
          await db

            .from("matches")

            .select(
              "id, player1, player2"
            )

            .eq(
              "discipline",
              discipline
            )

            .eq(
              "group_name",
              group
            );


        if (
          existing.error
        ) {

          throw existing.error;

        }


        const duplicate =

          (existing.data || [])

            .some(function(match) {

              return (

                (
                  match.player1 ===
                    player1

                  &&

                  match.player2 ===
                    player2
                )

                ||

                (
                  match.player1 ===
                    player2

                  &&

                  match.player2 ===
                    player1
                )

              );

            });


        if (duplicate) {

          message.textContent =
            "⚠️ Acest meci a fost deja introdus!";

          return;

        }


        message.textContent =
          "Se salvează rezultatul...";


        const result =
          await db

            .from("matches")

            .insert({

              discipline:
                discipline,

              group_name:
                group,

              player1:
                player1,

              player2:
                player2,

              score1:
                score1,

              score2:
                score2

            });


        if (
          result.error
        ) {

          throw result.error;

        }


        message.textContent =
          "✅ Rezultatul a fost salvat!";


        score1Input.value =
          "";

        score2Input.value =
          "";


        await loadMatches();

      }

      catch (error) {

        console.error(
          error
        );


        message.textContent =
          "EROARE: " +
          error.message;

      }

      finally {

        form.dataset.saving =
          "0";

      }

    }
  );

}


// =====================================================
// EDITARE MECI
// =====================================================

async function editMatch(id) {

  const match =
    (window.allMatches || [])
      .find(function(item) {

        return String(item.id) ===
          String(id);

      });


  if (!match) {
    return;
  }


  const newScore1 =
    Number(
      prompt(

        "Scor nou pentru " +
        match.player1 +

        " (actual: " +
        match.score1 +
        "):",

        match.score1

      )
    );


  if (

    !Number.isInteger(
      newScore1
    )

    ||

    newScore1 < 0

    ||

    newScore1 > 6

  ) {

    alert(
      "Scor invalid."
    );

    return;

  }


  const newScore2 =
    Number(
      prompt(

        "Scor nou pentru " +
        match.player2 +

        " (actual: " +
        match.score2 +
        "):",

        match.score2

      )
    );


  if (

    !Number.isInteger(
      newScore2
    )

    ||

    newScore2 < 0

    ||

    newScore2 > 6

  ) {

    alert(
      "Scor invalid."
    );

    return;

  }


  if (
    newScore1 ===
    newScore2
  ) {

    alert(
      "Un meci nu poate fi egal."
    );

    return;

  }


  if (
    newScore1 !== 6 &&
    newScore2 !== 6
  ) {

    alert(
      "Unul dintre jucători trebuie să aibă 6."
    );

    return;

  }


  const result =
    await db

      .from("matches")

      .update({

        score1:
          newScore1,

        score2:
          newScore2

      })

      .eq(
        "id",
        id
      );


  if (
    result.error
  ) {

    alert(

      "Nu am putut modifica meciul:\n\n" +

      result.error.message

    );

    return;

  }


  await loadMatches();

}


// =====================================================
// ȘTERGERE MECI
// =====================================================

async function deleteMatch(id) {

  const match =
    (window.allMatches || [])
      .find(function(item) {

        return String(item.id) ===
          String(id);

      });


  if (!match) {
    return;
  }


  const confirmed =
    confirm(

      "Ștergi definitiv acest meci?\n\n" +

      disciplineName(
        match.discipline
      ) +

      " • Grupa " +

      match.group_name +

      "\n\n" +

      match.player1 +

      " " +

      match.score1 +

      " – " +

      match.score2 +

      " " +

      match.player2

    );


  if (!confirmed) {
    return;
  }


  const result =
    await db

      .from("matches")

      .delete()

      .eq(
        "id",
        id
      );


  if (
    result.error
  ) {

    alert(

      "Nu am putut șterge meciul:\n\n" +

      result.error.message

    );

    return;

  }


  await loadMatches();

}


// =====================================================
// ADMIN — FILTRE + BUTOANE
// =====================================================

function setupAdmin() {

  const container =
    document.getElementById(
      "allMatchesAdmin"
    );


  if (!container) {
    return;
  }


  const disciplineFilter =
    document.getElementById(
      "adminFilterDiscipline"
    );


  const groupFilter =
    document.getElementById(
      "adminFilterGroup"
    );


  if (disciplineFilter) {

    disciplineFilter.addEventListener(
      "change",
      function() {

        renderAdminMatches(
          window.allMatches || []
        );

      }
    );

  }


  if (groupFilter) {

    groupFilter.addEventListener(
      "change",
      function() {

        renderAdminMatches(
          window.allMatches || []
        );

      }
    );

  }


  container.addEventListener(
    "click",
    async function(event) {

      const editButton =
        event.target.closest(
          "[data-edit-match]"
        );


      const deleteButton =
        event.target.closest(
          "[data-delete-match]"
        );


      if (editButton) {

        await editMatch(
          editButton.dataset.editMatch
        );

        return;

      }


      if (deleteButton) {

        await deleteMatch(
          deleteButton.dataset.deleteMatch
        );

      }

    }
  );

}


// =====================================================
// PORNIRE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setupScoreForm();

    setupAdmin();

    loadMatches();

  }
);