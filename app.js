const SUPABASE_URL = "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eGZ2c2pmZ2tidnpuY2dxanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTgzMzEsImV4cCI6MjEwNjE3NDMzMX0.knPPY953lVXXlmQWMx4Q_URR2YTnb-6o5F34_KiBTx8";

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
// DISCIPLINĂ
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

function getStandings(group, matches = []) {

  const rows =
    (GROUPS[group] || []).map(player => ({

      player,

      played: 0,
      wins: 0,
      losses: 0,
      points: 0,

      racksWon: 0,
      racksLost: 0,

      diff: 0

    }));


  matches
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
       