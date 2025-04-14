document.addEventListener('DOMContentLoaded', () => {
  const leagueSelect = document.getElementById('league-select');
  const seasonSelect = document.getElementById('season-select');
  const loadingSpinner = document.getElementById('loading-spinner');
  const standingsContent = document.getElementById('standings-content');

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
        option.textContent = league.name;
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

      const response = await fetch(`https://football-standings-api.vercel.app/leagues/${leagueId}/standings?season=${seasonYear}&sort=asc`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const rawData = await response.json();
      const data = rawData.data;

      // Hide the loading spinner
      loadingSpinner.classList.add('hidden');

      // Display the standings
      standingsContent.classList.remove('hidden');
      standingsContent.innerHTML = generateStandingsHTML(data);
    } catch (error) {
      console.error('Error fetching standings:', error);
      loadingSpinner.innerHTML = '<p class="text-red-500 text-3xl animate-ping">Failed to load data.</p>';
    }
  };

  // Function to generate HTML for standings
  const generateStandingsHTML = (data) => {
    const standings = data.standings;
    let html = `<h1 class="flex text-3xl font-semibold">Standings: ${data.name} for season: ${data.season}</h1><table class="min-w-full table-auto border-collapse border border-gray-300">`;
    html += `<thead><tr><th class="border border-gray-300 px-4 py-2">Position</th> <th> </th> <th class="border border-gray-300 px-4 py-2">Club</th><th class="border border-gray-300 px-4 py-2">Points</th></tr></thead><tbody>`;
    standings.forEach(team => {
      const position = team.stats.find(stat => stat.name === 'rank')?.value || '';
      const points = team.stats.find(stat => stat.name === 'points')?.value || '';
      html += `<tr>
        <td class="border border-gray-300 px-4 py-2 text-center">${position}</td>
        <td class="h-10 w-10"><img src=${team.team.logos[0]?.href}></td>
        <td class="border border-gray-300 px-4 py-2">${team.team.name}</td>
        <td class="border border-gray-300 px-4 py-2 text-center">${points}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    return html;
  };

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
