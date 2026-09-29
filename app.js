const SUPABASE_URL = "https://huxfvsjfgkbvzncgqjyl.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eGZ2c2pmZ2tidnpuY2dxanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTgzMzEsImV4cCI6MjEwNjE3NDMzMX0.knPPY953lVXXlmQWMx4Q_URR2YTnb-6o5F34_KiBTx8";

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
// DISCIPLINA
// =====================================================

const DISCIPLINE =
  document.body.dataset.discipline || "9ball";


function disciplineName() {

  if (DISCIPLINE === "8ball") {
    return "8-BALL";
  }

  return "9-BALL";

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
     