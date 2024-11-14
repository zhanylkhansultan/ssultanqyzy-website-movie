
$(document).ready(() => {
    $('#hamburger-menu').click(() => {
        $('#hamburger-menu').toggleClass('active')
        $('#nav-menu').toggleClass('active')
    })

    // Event listener for typing in the search input
    const searchInput = $('#search-input');
    const suggestionsContainer = $('#suggestions-container');

    searchInput.on('input', async function () {
        const query = $(this).val().trim();
        if (query.length > 2) {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=76f7b206ac3f329de1b4f22bfcdc89f2&query=${encodeURIComponent(query)}`);
                const data = await response.json();
                displaySuggestions(data.results);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            suggestionsContainer.empty(); // Clear suggestions if query is too short
        }
    });

    // Function to display suggestions
    function displaySuggestions(movies) {
        suggestionsContainer.empty(); // Clear previous suggestions
        if (movies.length > 0) {
            movies.slice(0, 5).forEach(movie => {
                const suggestionItem = $(`<div class="suggestion-item">${movie.title}</div>`);
                suggestionItem.on('click', () => {
                    searchInput.val(movie.title);
                    suggestionsContainer.empty(); // Clear suggestions when a title is selected
                    fetchSearchedMovies(movie.title); // Fetch movies based on the selected title
                });
                suggestionsContainer.append(suggestionItem);
            });
            suggestionsContainer.show();
        } else {
            suggestionsContainer.hide();
        }
    }

    // Hide suggestions container when clicking outside
    $(document).on('click', (e) => {
        if (!$(e.target).closest('.search').length) {
            suggestionsContainer.hide();
        }
    });

    // Search button event
    $('#search-btn').click(() => {
        const searchQuery = searchInput.val().trim();
        if (searchQuery) {
            fetchSearchedMovies(searchQuery);
            suggestionsContainer.empty(); // Clear suggestions on search
        }
    });
    // Fetch trending movies when the page loads
    fetchMovies();
    fetchTrendingMovies();
    displayWatchlist();
    const input = document.querySelector('.search input');
    const btn = document.querySelector('.search button');

    // Event listener for search button
    btn.addEventListener('click', () => {
        const searchQuery = input.value.trim();
        if (searchQuery) {
            fetchSearchedMovies(searchQuery);
        }
    });
    async function fetchTrendingMovies() {
        try {
            // Use the trending movies endpoint
            const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=76f7b206ac3f329de1b4f22bfcdc89f2`);
            const data = await response.json();
    
            // Use the first few trending movies to populate the hero carousel
            const heroCarousel = $('#hero-carousel');
            let heroItems = '';
    
            data.results.slice(0, 5).forEach(movie => {
                heroItems += `
                    <div class="hero-slide-item">
                        <img src="https://image.tmdb.org/t/p/w1280${movie.backdrop_path}" alt="${movie.title}">
                        <div class="overlay"></div>
                        <div class="hero-slide-item-content">
                            <div class="item-content-wraper">
                                <div class="item-content-title top-down">
                                    ${movie.title}
                                </div>
                                <div class="movie-infos top-down delay-2">
                                    <div class="movie-info">
                                        <i class="bx bxs-star"></i>
                                        <span>${movie.vote_average}</span>
                                    </div>
                                    <div class="movie-info">
                                        <i class="bx bxs-time"></i>
                                        <span>${movie.release_date || 'N/A'}</span>
                                    </div>
                                    <div class="movie-info">
                                        <span>HD</span>
                                    </div>
                                    <div class="movie-info">
                                        <span>16+</span>
                                    </div>
                                </div>
                                <div class="item-content-description top-down delay-4">
                                    ${movie.overview || 'No description available.'}
                                </div>
                                <div class="item-action top-down delay-6">
                                    <a href="#" class="btn btn-hover">
                                        <i class="bx bxs-right-arrow"></i>
                                        <span>Watch now</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
    
            // Insert the movie items into the carousel container
            heroCarousel.html(heroItems);
    
            // Check if the carousel already exists and destroy it before re-initializing
            if (heroCarousel.hasClass('owl-carousel')) {
                heroCarousel.trigger('destroy.owl.carousel');
                heroCarousel.removeClass('owl-carousel owl-loaded');
                heroCarousel.find('.owl-stage-outer').children().unwrap(); // Remove extra carousel markup
            }
    
            // Re-add the owl-carousel class and re-initialize the carousel
            heroCarousel.addClass('owl-carousel');
            heroCarousel.owlCarousel({
                loop: false,
                items: 1,
                margin: 0,
                nav: true,
                navText: ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"],
                autoplay: true,
                autoplayTimeout: 3000,
                responsive: {
                    0: {
                        items: 1
                    },
                    600: {
                        items: 1
                    },
                    1000: {
                        items: 1
                    }
                }
            });
    
        } catch (error) {
            console.error('Error fetching trending movie data:', error);
        }
    }
    
    // Call the function to populate the hero section when the page loads
    document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
    
    async function fetchSearchedMovies(query) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=76f7b206ac3f329de1b4f22bfcdc89f2&query=${encodeURIComponent(query)}`);
            const data = await response.json();
            displaySearchedMovies(data.results, `Search Results for "${query}"`);
        } catch (error) {
            console.error('Error fetching search data:', error);
        }
    }

    function displaySearchedMovies(movies, title = 'Your Searched Results') {
        const carouselContainer = $('.searched-movies-slide');
        const mainGridTitle = document.querySelector('.search-header');
        mainGridTitle.innerText = title;
        let movieItems = '';
    
        // Check if the carousel already exists and destroy it before re-initializing
        if (carouselContainer.hasClass('owl-carousel')) {
            carouselContainer.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
            carouselContainer.find('.owl-stage-outer').children().unwrap();
        }
    
        if (movies.length > 0) {
            movies.forEach(movie => {
                movieItems += `
                    <div class="movie-item" data-id="${movie.id}">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                        <div class="movie-item-content">
                            <div class="movie-item-title">${movie.title}</div>
                            <div class="movie-infos">
                                <div class="movie-info">
                                    <i class="bx bxs-star"></i>
                                    <span>${movie.vote_average}</span>
                                </div>
                                <div class="movie-info">
                                    <i class="bx bxs-time"></i>
                                    <span>${movie.release_date}</span>
                                </div>
                            </div>
                            <button class="add-watchlist-btn" data-id="${movie.id}">Add to Watchlist</button>
                        </div>
                    </div>
                `;
            });
    
            // Add new movie items to the container
            carouselContainer.html(movieItems);
            carouselContainer.addClass('owl-carousel'); // Re-add the carousel class if removed
    
            // Reinitialize Owl Carousel after adding new content
            carouselContainer.owlCarousel({
                loop: false,
                items: 2,
                margin: 15,
                nav: true,
                navText: ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"],
                responsive: {
                    500: {
                        items: 2
                    },
                    1280: {
                        items: 4
                    },
                    1600: {
                        items: 6
                    }
                }
            });
        } else {
            mainGridTitle.innerText = `No results found for "${title}"`;
            carouselContainer.html('<p class="no-results">No movies found. Please try another search.</p>');
        }
    }
    

    async function fetchMovies() {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=76f7b206ac3f329de1b4f22bfcdc89f2`);
            const data = await response.json();
            displayMovies(data.results, 'Trending Movies');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function displayMovies(movies, title = '') {
        const carouselContainer = $('.movies-slide');
        const mainGridTitle = document.querySelector('.section-header'); // Ensure you have a header for trending
        mainGridTitle.innerText = title;
        let movieItems = '';

        movies.forEach(movie => {
            movieItems += `
                <div class="movie-item" data-id="${movie.id}">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                    <div class="movie-item-content">
                        <div class="movie-item-title">${movie.title}</div>
                        <div class="movie-infos">
                            <div class="movie-info">
                                <i class="bx bxs-star"></i>
                                <span>${movie.vote_average}</span>
                            </div>
                            <div class="movie-info">
                                <i class="bx bxs-time"></i>
                                <span>${movie.release_date}</span>
                            </div>
                        </div>
                <button class="add-watchlist-btn" data-id="${movie.id}">Add to Watchlist</button>

                    </div>
                </div>
            `;
        });

        // Clear the container and add new movie items
        carouselContainer.html(movieItems);

        // Reinitialize Owl Carousel for trending movies
        carouselContainer.owlCarousel({
            loop: false,
            items: 2,
            margin: 15,
            nav: true,
            navText: ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"],
            responsive: {
                500: {
                    items: 2
                },
                1280: {
                    items: 4
                },
                1600: {
                    items: 6
                }
            }
        });
    }
});

$(document).ready(() => {
    // Existing code here...
    
    // Add event listener for movie item click to show modal
    $(document).on('click', '.movie-item', function () {
        const movieId = $(this).attr('data-id');
        showMovieModal(movieId);
    });

    // Function to show movie modal
    async function showMovieModal(movieId) {
        try {
            const movie = await getMovieDetails(movieId);
            populateModal(movie);
            $('#movie-modal').show();
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    }

    // Fetch movie details by ID
    async function getMovieDetails(id) {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=76f7b206ac3f329de1b4f22bfcdc89f2`);
        return await response.json();
    }

    // Populate modal with movie data
    function populateModal(movie) {
        $('#modal-poster').attr('src', `https://image.tmdb.org/t/p/w500${movie.poster_path}`);
        $('#modal-title').text(movie.title);
        $('#modal-overview').text(movie.overview);
        $('#modal-release-date').text(movie.release_date || 'N/A');
        $('#modal-rating').text(movie.vote_average || 'N/A');
        $('#modal-genres').text(movie.genres.map(genre => genre.name).join(', '));
    }

    // Close modal logic
    $('#close-modal').click(() => {
        $('#movie-modal').hide();
    });
    $(window).click((e) => {
        if ($(e.target).is('#movie-modal')) {
            $('#movie-modal').hide();
        }
    });
});

$(document).ready(() => {
    // Event listener for adding movies to the watchlist
    $(document).on('click', '.add-watchlist-btn', function (event) {
        event.stopPropagation();
        const movieId = $(this).closest('.movie-item').data('id');
        if (!movieId) {
            console.error('Movie ID is undefined or invalid.');
            return;
        }

        // Fetch movie details using the movie ID
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=76f7b206ac3f329de1b4f22bfcdc89f2`)
            .then(response => response.json())
            .then(movie => {
                if (movie.success === false || !movie.id) {
                    console.error('Error fetching movie:', movie.status_message || 'Invalid movie data');
                    return;
                }
                addToWatchlist(movie);
                displayWatchlist(); // Update watchlist display
            })
            .catch(error => console.error('Error adding to watchlist:', error));
    });

    // Event listener for removing movies from the watchlist
    $(document).on('click', '.remove-watchlist-btn', function (event) {
        event.stopPropagation();
        const movieId = $(this).data('id');
        removeFromWatchlist(movieId);
        displayWatchlist(); // Refresh the watchlist display after removal
    });

    // Function to get the watchlist from localStorage
    function getWatchlist() {
        const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        return watchlist;
    }

    // Function to save the watchlist to localStorage
    function saveWatchlist(watchlist) {
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }

    // Function to add a movie to the watchlist
    function addToWatchlist(movie) {
        const watchlist = getWatchlist();
        if (!watchlist.find(item => item.id === movie.id)) {
            watchlist.push(movie);
            saveWatchlist(watchlist);
            alert(`${movie.title} has been added to your watchlist.`);
        } else {
            alert(`${movie.title} is already in your watchlist.`);
        }
    }

    // Function to remove a movie from the watchlist
    function removeFromWatchlist(movieId) {
        let watchlist = getWatchlist();
        watchlist = watchlist.filter(movie => movie.id !== movieId);
        saveWatchlist(watchlist);
        alert('Movie removed from your watchlist.');
    }

    // Function to display the watchlist
    function displayWatchlist() {
        const watchlist = getWatchlist();
        const watchlistContainer = $('#watchlist-container');
        let watchlistItems = '';

        if (watchlist.length > 0) {
            watchlist.forEach(movie => {
                watchlistItems += `
                    <div class="movie-item-watchlist" data-id="${movie.id}">
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                        <div class="movie-item-content">
                            <div class="movie-item-title">${movie.title}</div>
                            <button class="remove-watchlist-btn" data-id="${movie.id}">Remove from Watchlist</button>
                        </div>
                    </div>
                `;
            });
            watchlistContainer.html(watchlistItems);
        } else {
            watchlistContainer.html('<p>Your watchlist is empty.</p>');
        }

        // Re-initialize carousel for the watchlist section if needed
        if (watchlistContainer.hasClass('owl-carousel')) {
            watchlistContainer.trigger('destroy.owl.carousel');
            watchlistContainer.removeClass('owl-carousel owl-loaded');
            watchlistContainer.find('.owl-stage-outer').children().unwrap();
        }
        watchlistContainer.addClass('owl-carousel');
        watchlistContainer.owlCarousel({
            loop: false,
            items: 2,
            margin: 15,
            nav: true,
            navText: ["<i class='bx bx-chevron-left'></i>", "<i class='bx bx-chevron-right'></i>"],
            responsive: {
                500: {
                    items: 2
                },
                1280: {
                    items: 4
                },
                1600: {
                    items: 6
                }
            }
        });
    }

    // Display the watchlist when the page loads
    displayWatchlist();
});
