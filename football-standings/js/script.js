document.addEventListener('DOMContentLoaded', () => {
  const leagueSelect = document.getElementById('league-select');
  const seasonSelect = document.getElementById('season-select');
  const loadingSpinner = document.getElementById('loading-spinner');
  const standingsContent = document.getElementById('standings-content');
  newsButtton = document.getElementById('news-button');

  // Function to fetch and populate leagues
  const fetchLeagues = async () => {
    try {
      const response = await fetch('https://football-standings-api.vercel.app/leagues');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const rawData = await response.json();
      const leagues = rawData.data;

      leagues.forEach(league => {
        const option = document.createElement('option');
        option.value = league.id;
        option.innerHTML = `<span style="/*background: linear-gradient(to right, #4caf50, #81c784); color: blue; padding: 4px 8px; border-radius: 4px; font-weight: bold;*/">${league.name}</span>`;
        leagueSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  // Function to fetch and populate seasons based on selected league
  const fetchSeasons = async (leagueId) => {
    try {
      const response = await fetch(`https://football-standings-api.vercel.app/leagues/${leagueId}/seasons`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const rawData = await response.json();
      const seasons = rawData.data.seasons;

      // Clear previous options
      seasonSelect.innerHTML = '<option value="">Select Season</option>';

      seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.year;
        option.textContent = season.displayName;
        seasonSelect.appendChild(option);
      });

      seasonSelect.disabled = false;
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  // Function to fetch and display standings
  const fetchStandings = async (leagueId, seasonYear) => {
    try {
      // Show the loading spinner
      loadingSpinner.classList.remove('hidden');
      standingsContent.classList.add('hidden');

      const responseBasic = await fetch(`https://football-standings-api.vercel.app/leagues/${leagueId}`);
      //if (!responseBasic.ok) throw new Error(`HTTP error! status: ${responseBasic.status}`);
      const response = await fetch(`https://football-standings-api.vercel.app/leagues/${leagueId}/standings?season=${seasonYear}&sort=asc`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const rawDataBasic = await responseBasic.json();
      const dataBasic = rawDataBasic.data;
      const rawData = await response.json();
      const data = rawData.data;

      // Hide the loading spinner
      loadingSpinner.classList.add('hidden');

      // Display the standings
      standingsContent.classList.remove('hidden');
      standingsContent.innerHTML = generateStandingsHTML(data,dataBasic);
    } catch (error) {
      console.error('Error fetching standings:', error);
      loadingSpinner.innerHTML = '<p class="text-red-500 text-3xl animate-ping">Failed to load data.</p>';
    }
  };

// Function to generate HTML for standings
const generateStandingsHTML = (data, dataBasic) => {
  const standings = data.standings;
  let html = `
    <h1 class="flex items-center text-3xl font-bold text-shadow-cyan-800" style="font-family: 'Verdana', sans-serif;">
      Standings:
      <img class="h-20 w-20 ml-2 mr-2 hidden md:block" src="${dataBasic?.logos?.light ?? ''}" alt="League Logo" />
      ${data.name} for Season: ${data.season} - ${data.season + 1}
    </h1>
    <table class="min-w-full table-auto border-collapse border border-gray-300 mt-4">
      <thead>
        <tr>
          <th class="text-2xl font-bold px-4 py-2">Position</th>
          <th class="hidden md:table-cell text-2xl font-bold px-4 py-2">Logo</th>
          <th class="text-2xl font-bold px-4 py-2">Club</th>
          <th class="hidden lg:table-cell text-2xl font-bold px-4 py-2">Games played</th>
          <th class="hidden md:table-cell text-2xl font-bold px-4 py-2">W-D-L</th>
          <th class="hidden lg:table-cell text-2xl font-bold px-4 py-2">Goal Difference</th>
          <th class="text-2xl font-bold px-4 py-2">Points</th>
        </tr>
      </thead>
      <tbody>
  `;

  standings.forEach(team => {
    const position = team.stats?.find(stat => stat.name === 'rank')?.value ?? '-';
    const points = team.stats?.find(stat => stat.name === 'points')?.value ?? '-';
    const logo = team.team?.logos?.[0]?.href ?? '';
    //const color = team.note.color ?? '-';
    const gamesPlayed = team.stats?.find(stat => stat.name === 'gamesPlayed')?.value ?? '-';
    const pointDifferential = team.stats?.find(stat => stat.name === 'pointDifferential')?.value ?? '-';
    const overall= team.stats?.find(stat => stat.name === 'overall')?.displayValue ?? '-';
    const teamName = team.team?.name ?? '-';

    html += `
      <tr>
        <td class="px-4 py-2 text-center font-semibold text-xl">${position}</td>
        <td class="hidden md:table-cell h-10 w-10 text-center">
          ${logo ? `<img src="${logo}" alt="${teamName} Logo" class="mx-auto h-10 w-10"/>` : ''}
        </td>
        <td class="px-4 py-2 text-xl font-serif">${teamName}</td>
        <td class="hidden lg:table-cell px-4 py-2 text-center text-xl font-semibold">${gamesPlayed}</td>
        <td class="hidden md:table-cell px-4 py-2 text-center text-xl font-semibold">${overall}</td>
        <td class="hidden lg:table-cell px-4 py-2 text-center text-xl font-semibold">${pointDifferential}</td>
        <td class="px-4 py-2 text-center text-xl font-semibold">${points}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  return html;
};

  
  // Event listener for news button
  newsButtton.addEventListener('click', () => {
    alert('Feature not yet available.')
  });
    // Event listeners for change in user selection
  ['change', 'click'].forEach(event => {
    leagueSelect.addEventListener(event, () => {
      const selectedLeague = leagueSelect.value;
      if (selectedLeague) {
        fetchSeasons(selectedLeague);
      } else {
        seasonSelect.innerHTML = '<option value="">Select Season</option>';//reset
        seasonSelect.disabled = true;
      }
    });
  });

  seasonSelect.addEventListener('change', () => {
    const selectedLeague = leagueSelect.value;
    const selectedSeason = seasonSelect.value;
    if (selectedLeague && selectedSeason) {
      fetchStandings(selectedLeague, selectedSeason);
    }
  });

  // Initial fetch of leagues
  fetchLeagues();
});
