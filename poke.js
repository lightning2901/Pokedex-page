const API_URL = 'https://pokeapi.co/api/v2/pokemon'; // desde aquí (según el Json) puedo acceder a las características excepto evolución
const pokemonListContainer = document.getElementById('pokemon-list');
const pokemonDetailsContainer = document.getElementById('pokemon-details');
const searchBar = document.getElementById('search-bar');
let allPokemon = []; // Almacena todos los Pokémon

async function fetchAllPokemon(url) {
    const response = await fetch(url);
    const data = await response.json();

    allPokemon = [...allPokemon, ...data.results];

    if (data.next) {
        await fetchAllPokemon(data.next);
    } else {
        displayPokemonList(allPokemon); 
    }
} // <-- Aquí faltaba la llave de cierre

// Mostrar los pokemones como botones
function displayPokemonList(pokemonList) {
    pokemonListContainer.innerHTML = '';
    pokemonList.forEach(pokemon => {
        const button = document.createElement('button');
        button.textContent = pokemon.name;
        button.addEventListener('click', () => fetchPokemonDetails(pokemon.url));
        pokemonListContainer.appendChild(button);
    });
}

async function fetchPokemonDetails(url) {
    const response = await fetch(url);
    const data = await response.json();
    displayPokemonDetails(data);
}

// Mostrar detalles del Pokémon
function displayPokemonDetails(pokemon) {
    pokemonDetailsContainer.innerHTML = `
        <h2>${pokemon.name} (#${pokemon.id})</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>Tipo:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p><strong>Evolutions:</strong> Loading...</p>
    `;
    fetchPokemonEvolutions(pokemon.id);
}

// Aquí fetchamos de otra url porque la anterior no posee los datos evolutivos de los pokemones
async function fetchPokemonEvolutions(pokemonId) {
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
    const speciesData = await speciesResponse.json();
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    const evolutionData = await evolutionResponse.json();
    
    const evolutions = getEvolutions(evolutionData.chain);
    document.querySelector('#pokemon-details p:last-child').textContent = `Evoluciones: ${evolutions.join(', ')}`;
}

function getEvolutions(chain) {
    const evolutions = [];
    let currentStage = chain;
    
    do {
        evolutions.push(currentStage.species.name);
        currentStage = currentStage.evolves_to[0] || null; // Asegurar que no arroje un error
    } while (currentStage && currentStage.evolves_to && currentStage.evolves_to.length);

    return evolutions;
}

// barra de búsqueda
searchBar.addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase();
    const buttons = pokemonListContainer.querySelectorAll('button');
    
    buttons.forEach(button => {
        if (button.textContent.toLowerCase().includes(searchText)) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
});

// llamada a la función 
fetchAllPokemon(API_URL);

