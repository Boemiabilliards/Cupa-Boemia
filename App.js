const groups = {
  A: [
    "Jucător A1",
    "Jucător A2",
    "Jucător A3",
    "Jucător A4",
    "Jucător A5",
    "Jucător A6",
    "Jucător A7"
  ],
  B: ["Jucător B1", "Jucător B2", "Jucător B3", "Jucător B4", "Jucător B5"],
  C: ["Jucător C1", "Jucător C2", "Jucător C3", "Jucător C4", "Jucător C5"],
  D: ["Jucător D1", "Jucător D2", "Jucător D3", "Jucător D4", "Jucător D5"],
  E: ["Jucător E1", "Jucător E2", "Jucător E3", "Jucător E4", "Jucător E5"]
};

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
          ${players.map((p, i) => `
            <tr>
              <td>
                <span class="rank">${i + 1}</span>
                <span class="player">${p}</span>
              </td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>
                ${
                  i < 2 && g === "A"
                    ? '<span class="qual">—</span>'
                    : i === 0 && g !== "A"
                      ? '<span class="qual">→</span>'
                      : '0'
                }
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </article>
  `).join("");

function match(a, b) {
  return `
    <div class="match">
      <div class="row">
        <span>${a}</span>
        <span class="score"></span>
      </div>
      <div class="row">
        <span>${b}</span>
        <span class="score"></span>
      </div>
    </div>
  `;
}

const playoff = [
  [
    ["A2", "B3"],
    ["B2", "C3"],
    ["C2", "D3"],
    ["D2", "E3"]
  ],
  [
    ["Câștigător 1", "Câștigător 3"],
    ["Câștigător 2", "Câștigător 4"]
  ],
  [
    ["Câștigător SF1", "Câștigător SF2"]
  ]
];

document.querySelector("#playoffBracket").innerHTML =
  playoff.map((round, i) => `
    <div class="round">
      <h3>
        ${
          [
            "SFERTURI • 8",
            "SEMIFINALE • 4",
            "FINALĂ PLAYOFF • 2"
          ][i]
        }
      </h3>

      ${round.map(x => match(x[0], x[1])).join("")}
    </div>
  `).join("");

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
  top8.map((round, i) => `
    <div class="round">
      <h3>${["SFERTURI", "
