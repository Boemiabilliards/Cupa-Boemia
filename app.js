"use strict";

/* =====================================================
   CONFIGURARE SUPABASE
===================================================== */

const SUPABASE_URL = "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY = "sb_publishable_mVu4zRZY5-7Ay7n7uUqk1A_4BRk_AgA";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const IS_ADMIN = !!document.getElementById("scoreForm");
const PAGE_DISCIPLINE = document.body.dataset.discipline || null;

let allMatches = [];
window.allMatches = allMatches;

/* =====================================================
   JUCĂTORI ȘI GRUPE
===================================================== */

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

const PLAYOFF_MATCHES = [
  { id: "P-M1", label: "M1", p1: ["B", 2], p2: ["C", 3] },
  { id: "P-M2", label: "M2", p1: ["C", 2], p2: ["D", 3] },
  { id: "P-M3", label: "M3", p1: ["D", 2], p2: ["E", 3] },
  { id: "P-M4", label: "M4", p1: ["E", 2], p2: ["B", 3] }
];

const SEMIFINALS = [
  { id: "P-SF1", label: "SF1", sources: ["P-M1", "P-M3"] },
  { id: "P-SF2", label: "SF2", sources: ["P-M2", "P-M4"] }
];

/* =====================================================
   UTILITARE
===================================================== */

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

function disciplineName(value) {
  if (value === "8ball") return "8-BALL";
  if (value === "9ball") return "9-BALL";
  return value || "";
}

function getDisciplineMatches(discipline) {
  return allMatches.filter(m => m.discipline === discipline);
}

function getGroupMatches(group, matches = allMatches) {
  return matches.filter(m => m.group_name === group);
}

function getMatchByCode(code, matches = allMatches) {
  return matches.find(m => m.group_name === code) || null;
}

function getWinner(match) {
  if (!match) return null;
  const a = Number(match.score1);
  const b = Number(match.score2);
  if (a === b) return null;
  return a > b ? match.player1 : match.player2;
}

/* =====================================================
   CLASAMENT GRUPE
===================================================== */

function getStandings(group, matches = []) {
  const rows = (GROUPS[group] || []).map(player => ({
    player,
    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
    racksWon: 0,
    racksLost: 0,
    diff: 0,
    rackPercent: 0
  }));

  getGroupMatches(group, matches).forEach(match => {
    const p1 = rows.find(r => r.player === match.player1);
    const p2 = rows.find(r => r.player === match.player2);

    if (!p1 || !p2) return;

    const s1 = Number(match.score1);
    const s2 = Number(match.score2);

    p1.played++;
    p2.played++;

    p1.racksWon += s1;
    p1.racksLost += s2;

    p2.racksWon += s2;
    p2.racksLost += s1;

    if (s1 > s2) {
      p1.wins++;
      p2.losses++;
      p1.points++;
    } else if (s2 > s1) {
      p2.wins++;
      p1.losses++;
      p2.points++;
    }
  });

  rows.forEach(row => {
    row.diff = row.racksWon - row.racksLost;

    const total = row.racksWon + row.racksLost;
    row.rackPercent = total ? row.racksWon / total * 100 : 0;
  });

  rows.sort((a, b) =>
    b.points - a.points ||
    b.rackPercent - a.rackPercent ||
    b.diff - a.diff ||
    b.racksWon - a.racksWon ||
    a.player.localeCompare(b.player, "ro")
  );

  return rows;
}

function getQualifiedPlayers(matches = allMatches) {
  const standings = {};

  Object.keys(GROUPS).forEach(group => {
    standings[group] = getStandings(group, matches);
  });

  return {
    group1First: standings.A[0]?.player || null,
    group1Second: standings.A[1]?.player || null,

    group2First: standings.B[0]?.player || null,
    group2Second: standings.B[1]?.player || null,
    group2Third: standings.B[2]?.player || null,

    group3First: standings.C[0]?.player || null,
    group3Second: standings.C[1]?.player || null,
    group3Third: standings.C[2]?.player || null,

    group4First: standings.D[0]?.player || null,
    group4Second: standings.D[1]?.player || null,
    group4Third: standings.D[2]?.player || null,

    group5First: standings.E[0]?.player || null,
    group5Second: standings.E[1]?.player || null,
    group5Third: standings.E[2]?.player || null
  };
}

/* =====================================================
   AFIȘARE GRUPE
===================================================== */

function renderGroups(matches = allMatches) {
  const container = document.getElementById("groupsContainer");
  if (!container) return;

  container.innerHTML = Object.keys(GROUPS).map(group => {
    const rows = getStandings(group, matches);

    return `
      <div class="group-card">
        <div class="group-title">
          <span>GRUPA ${group}</span>
          <small>${disciplineName(PAGE_DISCIPLINE)}</small>
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
              ${rows.map((p, i) => `
                <tr>
                  <td><strong>${i + 1}</strong></td>
                  <td><strong>${escapeHtml(p.player)}</strong></td>
                  <td>${p.played}</td>
                  <td>${p.wins}</td>
                  <td>${p.losses}</td>
                  <td>${p.racksWon}</td>
                  <td>${p.racksLost}</td>
                  <td>${p.rackPercent.toFixed(1)}%</td>
                  <td>${p.diff > 0 ? "+" : ""}${p.diff}</td>
                  <td><strong>${p.points}</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");
}

/* =====================================================
   PLAYOFF — CALCULAREA MECIURILOR
===================================================== */

function getPlayoffParticipants(matches = allMatches) {
  const q = getQualifiedPlayers(matches);

  return {
    "P-M1": [q.group2Second, q.group3Third],
    "P-M2": [q.group3Second, q.group4Third],
    "P-M3": [q.group4Second, q.group5Third],
    "P-M4": [q.group5Second, q.group2Third]
  };
}

function getPlayoffPlayers(matches = allMatches) {
  const participants = getPlayoffParticipants(matches);

  const result = {};

  Object.keys(participants).forEach(code => {
    const stored = getMatchByCode(code, matches);
    const expected = participants[code];

    if (
      stored &&
      expected[0] &&
      expected[1] &&
      [stored.player1, stored.player2].includes(expected[0]) &&
      [stored.player1, stored.player2].includes(expected[1])
    ) {
      result[code] = getWinner(stored);
    } else {
      result[code] = null;
    }
  });

  return result;
}

/* =====================================================
   AFIȘARE PLAYOFF
===================================================== */

function renderPlayoff(matches = allMatches) {
  const container = document.getElementById("playoffBracket");
  if (!container) return;

  const participants = getPlayoffParticipants(matches);
  const winners = getPlayoffPlayers(matches);

  function showPlayer(player) {
    return player ? escapeHtml(player) : "În așteptare";
  }

  function matchCard(code, label, players) {
    const stored = getMatchByCode(code, matches);

    const valid =
      stored &&
      players[0] &&
      players[1] &&
      [stored.player1, stored.player2].includes(players[0]) &&
      [stored.player1, stored.player2].includes(players[1]);

    return `
      <div class="bracket-match">
        <span>${label}</span>
        <strong>${showPlayer(players[0])}</strong>
        <span>VS</span>
        <strong>${showPlayer(players[1])}</strong>
        ${valid ? `
          <div class="match-score">
            ${stored.score1} – ${stored.score2}
          </div>
        ` : ""}
      </div>
    `;
  }

  const sf1Players = [
    winners["P-M1"],
    winners["P-M3"]
  ];

  const sf2Players = [
    winners["P-M2"],
    winners["P-M4"]
  ];

  container.innerHTML = `
    <div class="bracket-round">
      <h3>PLAYOFF</h3>
      <p>Locurile 2 și 3 din grupele B–E.</p>

      <h4>PRIMA FAZĂ — 8 → 4</h4>

      ${PLAYOFF_MATCHES.map(m =>
        matchCard(m.id, m.label, participants[m.id])
      ).join("")}

      <h4>SEMIFINALE — 4 → 2</h4>

      ${matchCard("P-SF1", "SF1", sf1Players)}
      ${matchCard("P-SF2", "SF2", sf2Players)}

      <p style="margin-top:20px;font-weight:700">
        Cei doi câștigători ai semifinalelor se califică în TOP 8.
      </p>
    </div>
  `;
}

/* =====================================================
   TOP 8
===================================================== */

function renderTop8(matches = allMatches) {
  const container = document.getElementById("top8Bracket");
  if (!container) return;

  const q = getQualifiedPlayers(matches);
  const winners = getPlayoffPlayers(matches);

  const sf1 = getMatchByCode("P-SF1", matches);
  const sf2 = getMatchByCode("P-SF2", matches);

  const qualified = [
    { player: q.group1First, detail: "Grupa A — Locul 1" },
    { player: q.group1Second, detail: "Grupa A — Locul 2" },
    { player: q.group2First, detail: "Grupa B — Locul 1" },
    { player: q.group3First, detail: "Grupa C — Locul 1" },
    { player: q.group4First, detail: "Grupa D — Locul 1" },
    { player: q.group5First, detail: "Grupa E — Locul 1" },
    { player: getWinner(sf1), detail: "Câștigător semifinală 1" },
    { player: getWinner(sf2), detail: "Câștigător semifinală 2" }
  ];

  container.innerHTML = `
    <div class="bracket-round">
      <h3>TOP 8 — ${disciplineName(PAGE_DISCIPLINE)}</h3>

      <p>
        Cei 8 jucători calificați în piramida finală.
      </p>

      ${qualified.map((item, i) => `
        <div class="bracket-match">
          <span>${i + 1}</span>
          <strong>${item.player ? escapeHtml(item.player) : "În așteptare"}</strong>
          <span>${item.detail}</span>
        </div>
      `).join("")}

      <p style="margin-top:20px;font-weight:700">
        Tragerea la sorți pentru piramida finală se face după încheierea playoff-ului.
      </p>
    </div>
  `;
}

/* =====================================================
   MECIURI RECENTE
===================================================== */

function groupLabel(group) {
  if (!group) return "";
  if (group.startsWith("P-")) {
    return "Playoff " + group.replace("P-", "");
  }
  return "Grupa " + group;
}

function renderRecent(matches = allMatches) {
  const container = document.getElementById("recentMatches");
  if (!container) return;

  if (!matches.length) {
    container.innerHTML = "<p>Nu există încă rezultate.</p>";
    return;
  }

  container.innerHTML = matches.slice(0, 30).map(match => `
    <div class="match-item">
      <div>
        <small>
          ${IS_ADMIN ? `<strong>${disciplineName(match.discipline)}</strong> • ` : ""}
          ${escapeHtml(groupLabel(match.group_name))}
        </small>
        <strong>${escapeHtml(match.player1)}</strong>
        <span>vs</span>
        <strong>${escapeHtml(match.player2)}</strong>
      </div>
      <div class="match-score">
        ${Number(match.score1)} – ${Number(match.score2)}
      </div>
    </div>
  `).join("");
}

/* =====================================================
   ADMIN — LISTA MECIURILOR
===================================================== */

function renderAdminMatches(matches = allMatches) {
  const container = document.getElementById("allMatchesAdmin");
  if (!container) return;

  const disciplineFilter =
    document.getElementById("adminFilterDiscipline")?.value || "";

  const groupFilter =
    document.getElementById("adminFilterGroup")?.value || "";

  const filtered = matches.filter(match =>
    (!disciplineFilter || match.discipline === disciplineFilter) &&
    (!groupFilter || match.group_name === groupFilter)
  );

  if (!filtered.length) {
    container.innerHTML = "<p>Nu există meciuri pentru filtrul ales.</p>";
    return;
  }

  container.innerHTML = filtered.map(match => `
    <div class="match-item" style="align-items:center;gap:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <small>
          <strong>${disciplineName(match.discipline)}</strong>
          • ${escapeHtml(groupLabel(match.group_name))}
        </small>
        <strong>${escapeHtml(match.player1)}</strong>
        <span>vs</span>
        <strong>${escapeHtml(match.player2)}</strong>
      </div>

      <div class="match-score">
        ${match.score1} – ${match.score2}
      </div>

      <div style="display:flex;gap:8px">
        <button type="button" data-edit-match="${match.id}">Editează</button>
        <button type="button" data-delete-match="${match.id}">Șterge</button>
      </div>
    </div>
  `).join("");
}

/* =====================================================
   ÎNCĂRCARE MECIURI
===================================================== */

async function loadMatches() {
  try {
    const { data, error } = await db
      .from("matches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    allMatches = data || [];
    window.allMatches = allMatches;

    const visibleMatches = PAGE_DISCIPLINE
      ? allMatches.filter(m => m.discipline === PAGE_DISCIPLINE)
      : allMatches;

    renderGroups(visibleMatches);
    renderPlayoff(visibleMatches);
    renderTop8(visibleMatches);
    renderRecent(visibleMatches);

    if (IS_ADMIN) {
      renderAdminMatches(allMatches);
      updateAdminPlayerOptions();
    }

  } catch (error) {
    console.error("Eroare la încărcarea meciurilor:", error);

    const containers = [
      "groupsContainer",
      "playoffBracket",
      "top8Bracket",
      "recentMatches",
      "allMatchesAdmin"
    ];

    containers.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = `<p>Eroare la încărcarea datelor: ${escapeHtml(error.message)}</p>`;
      }
    });
  }
}

/* =====================================================
   ADMIN — OPȚIUNI JUCĂTORI
===================================================== */

function getAdminParticipants() {
  const group = document.getElementById("scoreGroup")?.value;
  const discipline = document.getElementById("scoreDiscipline")?.value;

  if (!group) return [];

  const matches = getDisciplineMatches(discipline);

  if (GROUPS[group]) {
    return [...GROUPS[group]];
  }

  if (group.startsWith("P-M")) {
    const participants = getPlayoffParticipants(matches);
    return participants[group.replace("P-", "")] || [];
  }

  if (group === "P-SF1" || group === "P-SF2") {
    const winners = getPlayoffPlayers(matches);
    const sources = group === "P-SF1"
      ? ["P-M1", "P-M3"]
      : ["P-M2", "P-M4"];

    return sources.map(code => winners[code]).filter(Boolean);
  }

  return [];
}

function updateAdminPlayerOptions() {
  const player1 = document.getElementById("scorePlayer1");
  const player2 = document.getElementById("scorePlayer2");

  if (!player1 || !player2) return;

  const previous1 = player1.value;
  const previous2 = player2.value;

  const players = getAdminParticipants();

  function fill(select, previous) {
    select.innerHTML =
      `<option value="">Alege jucătorul</option>` +
      players.map(player =>
        `<option value="${escapeHtml(player)}">${escapeHtml(player)}</option>`
      ).join("");

    if (players.includes(previous)) {
      select.value = previous;
    }
  }

  fill(player1, previous1);
  fill(player2, previous2);

  if (player1.value && player1.value === player2.value) {
    player2.value = "";
  }
}

/* =====================================================
   VALIDARE ȘI SALVARE SCOR
===================================================== */

function validateScore(score1, score2) {
  if (
    !Number.isInteger(score1) ||
    !Number.isInteger(score2) ||
    score1 < 0 ||
    score2 < 0 ||
    score1 > 6 ||
    score2 > 6
  ) {
    return "Scor invalid. Introdu valori între 0 și 6.";
  }

  if (score1 === score2) {
    return "Un meci nu poate fi egal.";
  }

  if (score1 !== 6 && score2 !== 6) {
    return "Unul dintre jucători trebuie să aibă 6.";
  }

  return null;
}

function setupScoreForm() {
  const form = document.getElementById("scoreForm");
  if (!form) return;

  const groupSelect = document.getElementById("scoreGroup");
  const disciplineSelect = document.getElementById("scoreDiscipline");
  const player1Select = document.getElementById("scorePlayer1");
  const player2Select = document.getElementById("scorePlayer2");

  groupSelect.addEventListener("change", updateAdminPlayerOptions);
  disciplineSelect.addEventListener("change", updateAdminPlayerOptions);

  player1Select.addEventListener("change", () => {
    if (player1Select.value === player2Select.value) {
      player2Select.value = "";
    }
  });

  player2Select.addEventListener("change", () => {
    if (player1Select.value === player2Select.value) {
      player1Select.value = "";
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (form.dataset.saving === "1") return;

    const message = document.getElementById("scoreMessage");

    const discipline = disciplineSelect.value;
    const group = groupSelect.value;
    const player1 = player1Select.value;
    const player2 = player2Select.value;

    const score1 = Number(document.getElementById("score1").value);
    const score2 = Number(document.getElementById("score2").value);

    if (!discipline || !group || !player1 || !player2) {
      message.textContent = "Completează toate câmpurile.";
      return;
    }

    if (player1 === player2) {
      message.textContent = "Alege doi jucători diferiți.";
      return;
    }

    const validation = validateScore(score1, score2);

    if (validation) {
      message.textContent = validation;
      return;
    }

    const existing = getDisciplineMatches(discipline)
      .find(m =>
        m.group_name === group &&
        (
          (m.player1 === player1 && m.player2 === player2) ||
          (m.player1 === player2 && m.player2 === player1)
        )
      );

    if (existing) {
      message.textContent = "Acest meci există deja. Editează rezultatul existent.";
      return;
    }

    if (group.startsWith("P-")) {
      const participants = getAdminParticipants();

      if (
        !participants.includes(player1) ||
        !participants.includes(player2)
      ) {
        message.textContent = "Jucătorii selectați nu corespund acestei faze de playoff.";
        return;
      }
    }

    form.dataset.saving = "1";
    message.textContent = "Se salvează rezultatul...";

    try {
      const { error } = await db
        .from("matches")
        .insert({
          discipline,
          group_name: group,
          player1,
          player2,
          score1,
          score2
        });

      if (error) throw error;

      message.textContent = "Rezultatul a fost salvat.";

      document.getElementById("score1").value = "";
      document.getElementById("score2").value = "";

      await loadMatches();

    } catch (error) {
      console.error(error);
      message.textContent = "EROARE: " + error.message;
    } finally {
      form.dataset.saving = "0";
    }
  });
}

/* =====================================================
   EDITARE MECI
===================================================== */

async function editMatch(id) {
  const match = allMatches.find(item => String(item.id) === String(id));
  if (!match) return;

  const score1Text = prompt(
    `Scor nou pentru ${match.player1}:`,
    match.score1
  );

  if (score1Text === null) return;

  const score2Text = prompt(
    `Scor nou pentru ${match.player2}:`,
    match.score2
  );

  if (score2Text === null) return;

  const score1 = Number(score1Text);
  const score2 = Number(score2Text);

  const validation = validateScore(score1, score2);

  if (validation) {
    alert(validation);
    return;
  }

  const { error } = await db
    .from("matches")
    .update({ score1, score2 })
    .eq("id", id);

  if (error) {
    alert("Nu am putut modifica meciul:\n" + error.message);
    return;
  }

  await loadMatches();
}

/* =====================================================
   ȘTERGERE MECI
===================================================== */

async function deleteMatch(id) {
  const match = allMatches.find(item => String(item.id) === String(id));
  if (!match) return;

  const confirmed = confirm(
    "Ștergi definitiv acest meci?\n\n" +
    disciplineName(match.discipline) + "\n" +
    groupLabel(match.group_name) + "\n\n" +
    match.player1 + " " + match.score1 +
    " – " + match.score2 + " " + match.player2
  );

  if (!confirmed) return;

  const { error } = await db
    .from("matches")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Nu am putut șterge meciul:\n" + error.message);
    return;
  }

  await loadMatches();
}

/* =====================================================
   ADMIN — FILTRE ȘI BUTOANE
===================================================== */

function setupAdmin() {
  const container = document.getElementById("allMatchesAdmin");
  if (!container) return;

  const disciplineFilter = document.getElementById("adminFilterDiscipline");
  const groupFilter = document.getElementById("adminFilterGroup");

  disciplineFilter?.addEventListener("change", () => {
    renderAdminMatches(allMatches);
  });

  groupFilter?.addEventListener("change", () => {
    renderAdminMatches(allMatches);
  });

  container.addEventListener("click", async event => {
    const editButton = event.target.closest("[data-edit-match]");
    const deleteButton = event.target.closest("[data-delete-match]");

    if (editButton) {
      await editMatch(editButton.dataset.editMatch);
      return;
    }

    if (deleteButton) {
      await deleteMatch(deleteButton.dataset.deleteMatch);
    }
  });
}

/* =====================================================
   PORNIRE
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  setupScoreForm();
  setupAdmin();
  await loadMatches();
});