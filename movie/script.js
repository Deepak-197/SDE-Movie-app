


const backendUrl = 'http://localhost:8080';
   let accessToken = localStorage.getItem("token"); 
let token;

async function searchMovies() {
  const movieTitle = document.getElementById('movieTitle').value;
  if (!movieTitle) return;

  try {
    const response = await fetch(`http://www.omdbapi.com/?apikey=50726e83&s=${encodeURIComponent(movieTitle)}`);
    const data = await response.json();
    if (data.Response === 'True') {
      displaySearchResults(data.Search);
      document.getElementById('publicPlaylistForm').style.display = 'block';
      document.getElementById('loginForm').style.display = 'block';
    } else {
      alert('Movie not found.');
    }
  } catch (error) {
    alert('Error occurred while searching for movies.');
    console.error(error);
  }
}

function displaySearchResults(results) {
  const searchResultsDiv = document.getElementById('searchResults');
  searchResultsDiv.innerHTML = '';
  results.forEach((movie) => {
    const movieDiv = document.createElement('div');
    movieDiv.innerHTML = `
      <p><strong>${movie.Title}</strong></p>
      <img src="${movie.Poster}" alt="${movie.Title} Poster" width="150">
      <button onclick="showAddToPlaylist('${movie.Title}', '${movie.Poster}')">Add to Playlist</button>
    `;
    searchResultsDiv.appendChild(movieDiv);
  });
}

function showAddToPlaylist(movieName, moviePoster) {
  document.getElementById('addMovieForm').style.display = 'block';
  document.getElementById('movieName').value = movieName;
  document.getElementById('moviePoster').value = moviePoster;
}

async function createPublicPlaylist() {
  const publicPlaylistName = document.getElementById('publicPlaylistName').value;
  const movies = document.getElementById('searchResults').getElementsByTagName('img');

  if (!publicPlaylistName) {
    alert('Please enter a valid playlist name.');
    return;
  }

  const playlistData = { name: publicPlaylistName, isPublic: true, movies: [] };

 
  for (let i = 0; i < movies.length; i++) {
    const movieName = movies[i].previousElementSibling.textContent;
    const moviePoster = movies[i].getAttribute('src');
    playlistData.movies.push({ movieName, moviePoster });
  }

  
  try {
    const response = await fetch(`${backendUrl}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playlistData),
    });

    if (response.ok) {
      alert('Public playlist created successfully.');
    } else {
      alert('Failed to create public playlist.');
    }
  } catch (error) {
    alert('Error occurred while creating the public playlist.');
    console.error(error);
  }
}

async function registerUser() {
  const registerUsername = document.getElementById('registerUsername').value;
  const registerPassword = document.getElementById('registerPassword').value;

  try {
    const response = await fetch(`${backendUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: registerUsername, password: registerPassword }),
    });

    if (response.ok) {
      alert('Registration successful. You can now login.');
      document.getElementById('registerForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';
    } else {
      alert('Registration failed. Please try again with a different username.');
    }
  } catch (error) {
    alert('Error occurred during registration.');
    console.error(error);
  }
}

async function loginUser() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${backendUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      token = data.token;
      localStorage.setItemI("token", token)
      alert('Logged in successfully.');
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('playlistForm').style.display = 'block';
      await loadUserPlaylists();
      document.getElementById('addMovieForm').style.display = 'block';
    } else {
      alert('Login failed. Please check your credentials.');
    }
  } catch (error) {
    alert('Error occurred while logging in.');
    console.error(error);
  }
}

async function loadUserPlaylists() {
  try {
    const response = await fetch(`${backendUrl}/playlists`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    const playlistSelect = document.getElementById('playlistSelect');
    playlistSelect.innerHTML = '';
    data.forEach((playlist) => {
      const option = document.createElement('option');
      option.text = playlist.name;
      option.value = playlist._id;
      playlistSelect.appendChild(option);
    });
  } catch (error) {
    alert('Error occurred while fetching user playlists.');
    console.error(error);
  }
}

async function createPrivatePlaylist() {
  const privatePlaylistName = document.getElementById('privatePlaylistName').value;
  if (!privatePlaylistName) {
    alert('Please enter a valid playlist name.');
    return;
  }

  try {
    const response = await fetch(`${backendUrl}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: privatePlaylistName, isPublic: false, movies: [] }),
    });

    if (response.ok) {
      alert('Private playlist created successfully.');
      await loadUserPlaylists();
    } else {
      alert('Failed to create private playlist.');
    }
  } catch (error) {
    alert('Error occurred while creating the private playlist.');
    console.error(error);
  }
}

async function addMovieToPlaylist() {
  const playlistId = document.getElementById('playlistSelect').value;
  const movieName = document.getElementById('movieName').value;
  const moviePoster = document.getElementById('moviePoster').value;

  if (!movieName || !moviePoster) {
    alert('Please enter valid movie details.');
    return;
  }

  try {
    const response = await fetch(`${backendUrl}/playlists/${playlistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ movieName, moviePoster }),
    });

    if (response.ok) {
      alert('Movie added to playlist successfully.');
    } else {
      alert('Failed to add movie to playlist.');
    }
  } catch (error) {
    alert('Error occurred while adding movie to playlist.');
    console.error(error);
  }
}
