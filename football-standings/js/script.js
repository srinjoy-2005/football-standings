
document.addEventListener('DOMContentLoaded', () => {
const loadingSpinner = document.getElementById('loading-spinner');
const standingsContent = document.getElementById('standings-content');

// Show the loading spinner
loadingSpinner.classList.remove('hidden');
standingsContent.classList.add('hidden');

// Function to fetch and display standings
const fetchStandings = async () => {
    try {
    const response = await fetch('https://api.football-data.org/v4/competitions/PL/standings', {
        headers: {
        'X-Auth-Token': 'YOUR_API_KEY' // Replace with your actual API key
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Hide the loading spinner
    loadingSpinner.classList.add('hidden');

    // Display the standings
    standingsContent.classList.remove('hidden');
    standingsContent.innerHTML = generateStandingsHTML(data);
    } catch (error) {
    console.error('Error fetching data:', error);
    loadingSpinner.innerHTML = '<p class="text-red-500">Failed to load data.</p>';
    }
};

// Function to generate HTML for standings
const generateStandingsHTML = (data) => {
    const standings = data.standings[0].table;
    let html = '<table class="min-w-full table-auto border-collapse border border-gray-300">';
    html += '<thead><tr><th class="border border-gray-300 px-4 py-2">Position</th><th class="border border-gray-300 px-4 py-2">Team</th><th class="border border-gray-300 px-4 py-2">Points</th></tr></thead><tbody>';
    standings.forEach(team => {
    html += `<tr>
        <td class="border border-gray-300 px-4 py-2 text-center">${team.position}</td>
        <td class="border border-gray-300 px-4 py-2">${team.team.name}</td>
        <td class="border border-gray-300 px-4 py-2 text-center">${team.points}</td>
    </tr>`;
    });
    html += '</tbody></table>';
    return html;
};

// Initiate the fetch
fetchStandings();
});
