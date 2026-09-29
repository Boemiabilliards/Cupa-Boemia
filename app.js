const SUPABASE_URL = "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eGZ2c2pmZ2tidnpuY2dxanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTgzMzEsImV4cCI6MjEwNjE3NDMzMX0.knPPY953lVXXlmQWMx4Q_URR2YTnb-6o5F34_KiBTx8";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =====================================================
// GRUPELE ȘI JUCĂTORII
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
// PAGINA CURENTĂ
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
    .replace(
      /[&<>"']/g,
      function(character) {

        return {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        }[character];

      }
    );

}


// =====================================================
// CLASAMENT
// =====================================================

function getStandings(
  group,
  matches = []
) {

  const rows =
    (GROUPS[group] || [])
      .map(function(player) {

        return {

          player: player,

          played: 0,

          wins: 0,

          losses: 0,

          points: 0,

          racksWon: 0,

          racksLost: 0,

          diff: 0

        };

      });


  matches

    .filter(function(match) {

      return match.group_name === group;

    })

    .forEach(function(match) {

      const player1 =
        rows.find(function(row) {

          return row.player ===
            match.player1;

        });


      const player2 =
        rows.find(function(row) {

          return row.player ===
            match.player2;

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

        player1.points += 2;

      }

      else if (score2 > score1) {

        player2.wins++;

        player1.losses++;

        player2.points += 2;

      }

    });


  rows.forEach(function(row) {

    row.diff =
      row.racksWon -
      row.racksLost;

  });


  rows.sort(function(a, b) {

    return (

      b.points - a.points ||

      b.wins - a.wins ||

      b.diff - a.diff ||

      b.racksWon - a.racksWon ||

      a.player.localeCompare(
        b.player,
        "ro"
      )

    );

  });


  return rows;

}


// =====================================================
// AFIȘARE GRUPE
// =====================================================

function renderGroups(
  matches = []
) {

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

                    <th>#</th>

                    <th>
                      Jucător
                    </th>

                    <th>
                      M
                    </th>

                    <th>
                      V
                    </th>

                    <th>
                      Î
                    </th>

                    <th>
                      Dif.
                    </th>

                    <th>
                      Pts
                    </th>

                  </tr>

                </thead>


                <tbody>

                  ${rows.map(
                    function(player, index) {

                      return `

                        <tr>

                          <td>
                            ${index + 1}
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
                            ${
                              player.diff > 0
                                ? "+"
                                : ""
                            }${player.diff}
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
// CALIFICAȚI
// =====================================================

function getQualifiedPlayers(
  matches = []
) {

  const qualified = [];


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


  ["B", "C", "D", "E"]

    .forEach(function(group) {

      const standings =
        getStandings(
          group,
          matches
        );


      qualified.push(
        standings[0]?.player || null
      );

    });


  while (
    qualified.length < 8
  ) {

    qualified.push(null);

  }


  return qualified.slice(
    0,
    8
  );

}


// =====================================================
// PLAYOFF
// =====================================================

function renderPlayoff(
  matches = []
) {

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


      ${qualified.map(
        function(player, index) {

          return `

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

          `;

        }
      ).join("")}

    </div>

  `;

}


// =====================================================
// TOP 8
// =====================================================

function renderTop8(
  matches = []
) {

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

        TOP 8 —
        ${disciplineName(
          PAGE_DISCIPLINE
        )}

      </h3>


      ${qualified.map(
        function(player, index) {

          return `

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

          `;

        }
      ).join("")}

    </div>

  `;

}


// =====================================================
// MECIURI RECENTE
// =====================================================

function renderRecent(
  matches = []
) {

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

function renderAdminMatches(
  matches = []
) {

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


              <div
                style="
                  margin-top:5px;
                "
              >

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
// =====================================================

async function loadMatches() {

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


    // PUBLIC:
    // încărcăm doar disciplina paginii

    if (!IS_ADMIN) {

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

      return;

    }


    const matches =
      data || [];


    window.allMatches =
      matches;


    // PAGINI PUBLICE

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


    // ADMIN

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


  // ===========================================
  // POPULARE JUCĂTORI
  // ===========================================

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


  // IMPORTANT:
  // populați inițial

  populatePlayers();


  // ===========================================
  // SALVARE REZULTAT
  // ===========================================

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


      // VALIDARE

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

        !Number.isInteger(
          score1
        )

        ||

        !Number.isInteger(
          score2
        )

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


        // =========================================
        // VERIFICARE DUPLICAT
        // =========================================

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


        // =========================================
        // INSERT
        // =========================================

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


        // reîncarcă imediat
        // clasamentele și meciurile

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

async function editMatch(
  id
) {

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

async function deleteMatch(
  id
) {

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
// PORNIRE SITE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setupScoreForm();

    setupAdmin();

    loadMatches();

  }
);