// Get DOM Elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

const greeting = document.getElementById("greeting");
const attendanceCount = document.getElementById("attendanceCount");
const progressBar = document.getElementById("attendanceBar");
const celebration = document.getElementById("celebration");
const attendeeList = document.getElementById("attendeeList");
const leaderboardEntries = document.getElementById("leaderboardEntries");

const maxCount = 50;

// Load saved data
let count = Number(localStorage.getItem("totalAttendance")) || 0;

let teamCounts = JSON.parse(localStorage.getItem("teamCounts")) || {
  waterWise: 0,
  netZero: 0,
  renewables: 0,
};

let attendees = JSON.parse(localStorage.getItem("attendees")) || [];

// Update page on load
if (attendanceCount) attendanceCount.textContent = count;

if (document.getElementById("waterWiseCount"))
  document.getElementById("waterWiseCount").textContent = teamCounts.waterWise;

if (document.getElementById("netZeroCount"))
  document.getElementById("netZeroCount").textContent = teamCounts.netZero;

if (document.getElementById("renewablesCount"))
  document.getElementById("renewablesCount").textContent =
    teamCounts.renewables;

updateProgress();
updateTeamPercentages();
updateLeaderboard();
renderAttendees();
updateCelebration();

console.log(
  "Loaded attendance data:",
  {
    totalAttendance: count,
    teamCounts: teamCounts,
    attendeeCount: attendees.length,
  }
);

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const team = teamSelect.value;
    const teamName = teamSelect.options[teamSelect.selectedIndex].text;

    console.log("Form submit event", { name: name, team: team, teamName: teamName });

    if (!name || !team) {
      console.warn("Incomplete check-in data, check fields.", { name: name, team: team });
      return;
    }

    // Greeting
    showGreeting(`🎉 Welcome, ${name} from ${teamName}!`);

    // Attendance Count
    count++;
    if (attendanceCount) attendanceCount.textContent = count;

    // Team Count
    teamCounts[team] = (teamCounts[team] || 0) + 1;
    const teamCountEl = document.getElementById(team + "Count");
    if (teamCountEl) teamCountEl.textContent = teamCounts[team];

    // Add attendee
    attendees.push({
      name: name,
      team: teamName,
    });

    console.log(
      "Check-in completed",
      {
        name: name,
        team: teamName,
        totalAttendance: count,
        teamCounts: teamCounts,
        attendeeCount: attendees.length,
      }
    );

    console.log("Team attendance percentages", getTeamBreakdown());

    renderAttendees();
    updateTeamPercentages();
    updateLeaderboard();
    saveAttendanceData();
    updateProgress();
    updateCelebration();

    form.reset();
  });
}

function showGreeting(message) {
  if (!greeting) return;

  console.log("Showing greeting message", message);
  greeting.textContent = message;
  greeting.classList.add("success-message");
  greeting.style.display = "block";
}

function saveAttendanceData() {
  localStorage.setItem("totalAttendance", count);
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("attendees", JSON.stringify(attendees));

  console.log("Saved attendance data to localStorage", {
    totalAttendance: count,
    teamCounts: teamCounts,
    attendeeCount: attendees.length,
  });
}

function updateCelebration() {
  if (!celebration) return;

  if (count >= maxCount) {
    const winningTeam = getWinningTeam();
    const message = `🏆 Attendance Goal Reached! Winning Team: ${winningTeam}`;
    celebration.textContent = message;
    celebration.classList.add("success-message");
    celebration.style.display = "block";
    console.log("Celebration triggered", {
      totalAttendance: count,
      winningTeam: winningTeam,
      message: message,
    });
  } else {
    celebration.textContent = "";
    celebration.classList.remove("success-message");
    celebration.style.display = "none";
  }
}

function updateProgress() {
  if (!progressBar) return;

  const percent = Math.min((count / maxCount) * 100, 100);

  progressBar.style.width = percent + "%";
  progressBar.textContent = Math.round(percent) + "%";

  console.log("Progress updated", {
    count: count,
    maxCount: maxCount,
    percent: Math.round(percent),
  });
}

function getWinningTeam() {
  let winner = "Water Wise";
  let highest = teamCounts.waterWise || 0;

  if ((teamCounts.netZero || 0) > highest) {
    winner = "Net Zero";
    highest = teamCounts.netZero;
  }

  if ((teamCounts.renewables || 0) > highest) {
    winner = "Renewables";
  }

  return winner;
}

function getTeamBreakdown() {
  const total = Math.max(count, 1);
  return {
    waterWise: {
      count: teamCounts.waterWise,
      percent: ((teamCounts.waterWise / total) * 100).toFixed(1) + "%",
    },
    netZero: {
      count: teamCounts.netZero,
      percent: ((teamCounts.netZero / total) * 100).toFixed(1) + "%",
    },
    renewables: {
      count: teamCounts.renewables,
      percent: ((teamCounts.renewables / total) * 100).toFixed(1) + "%",
    },
  };
}

function updateTeamPercentages() {
  const breakdown = getTeamBreakdown();

  const waterPercentEl = document.getElementById("waterWisePercent");
  const netZeroPercentEl = document.getElementById("netZeroPercent");
  const renewablesPercentEl = document.getElementById("renewablesPercent");

  if (waterPercentEl) waterPercentEl.textContent = breakdown.waterWise.percent;
  if (netZeroPercentEl) netZeroPercentEl.textContent = breakdown.netZero.percent;
  if (renewablesPercentEl)
    renewablesPercentEl.textContent = breakdown.renewables.percent;
}

function updateLeaderboard() {
  if (!leaderboardEntries) return;

  const teams = [
    { name: "Team Water Wise", count: teamCounts.waterWise },
    { name: "Team Net Zero", count: teamCounts.netZero },
    { name: "Team Renewables", count: teamCounts.renewables },
  ];

  teams.sort(function (a, b) {
    return b.count - a.count;
  });

  leaderboardEntries.innerHTML = "";

  teams.forEach(function (team, index) {
    const item = document.createElement("div");
    item.className = "leaderboard-item" + (index === 0 ? " top" : "");

    const badge = document.createElement("span");
    const badgeStyles = ["gold", "silver", "bronze"];
    const badgeLabels = ["1st", "2nd", "3rd"];
    badge.className = "leaderboard-badge " + badgeStyles[index];
    badge.textContent = badgeLabels[index];

    const name = document.createElement("span");
    name.className = "leaderboard-name";
    name.textContent = team.name;

    const count = document.createElement("span");
    count.textContent = `${team.count} attendee${team.count === 1 ? "" : "s"}`;

    item.appendChild(badge);
    item.appendChild(name);
    item.appendChild(count);

    leaderboardEntries.appendChild(item);
  });
}

function renderAttendees() {
  if (!attendeeList) return;

  attendeeList.innerHTML = "";

  attendees.forEach(function (attendee) {
    const li = document.createElement("li");

    li.textContent = `${attendee.name} - ${attendee.team}`;

    attendeeList.appendChild(li);
  });

  console.log("Rendered attendee list", attendees);
}
