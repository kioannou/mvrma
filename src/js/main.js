/**
 *  NOTE:
 *  For this project i used:
 *  - jQuery
 *  - bootstrap
 *
 *  Sorry for not creating testing suites for my project. I have minimal experience with unit testing.
 *
 *  My modules are:
 *  src/js/main.js - My main module
 *  src/js/moviesData.js - Module contains all the ajax requests
 *  src/js/moviesView.js - Module contains all DOM manipulation functionality
 *  src/js/settings.js - Module hold the application related variables
 *
 *  1)npm install
 *  2)npm run serve
 *  3)Go to http://localhost:3000/
 */

/**
 * @module {Module} src/js/main.js
 *
 * Applications main file and entry point.
 */
var _ = require("underscore");
var $ = jQuery = require("jquery");
var Debug = require("debug");
require("bootstrap");
//Define the app.js logger
var debug = Debug("app");
Debug.enable('*');

var MoviesData = require("./moviesData.js");
var MoviesView = require("./moviesView.js");
var Settings = require("./settings.js");

//document is ready
$(document).ready(function () {

    /**
     * Global object indicating which is the page's current mode ("inTheaterMovies" or "searchingMovies")
     * and current page number
     * @name page
     * @type {{mode: string, number: number}}
     */
    var page = {
        mode: "inTheaterMovies",
        number: 1
    };

    //Assigning events
    var $moviesList = $('#movies-list');
    //Assigning event for toggling movie details
    $moviesList.on("click", "div.movies-item", function (e) {
        var newlySelectedMovieID = $(this).attr('id');
        debug("Clicked id:", newlySelectedMovieID);
        e.stopPropagation();

        toggleMovieDetails(newlySelectedMovieID);
    });

    var $searchButton = $('#search-button');
    var $searchInput = $('#search-input');

    //Assigning click event on search button
    $searchButton.on("click", function () {
        searchForMovie(false);
    });

    //Assigning event on key up of the search input
    $searchInput.keyup(function () {

        var s = $searchInput.val();

        setTimeout(function () {
            if ($searchInput.val() == s) {
                // Check the value searched is the latest one or not.
                // This will help in making the ajax call work when client stops writing.
                searchForMovie(false);
            }
        }, 500); // Delay
    });

    /*Assigning an event to window for when user scrolls to bottom to fetch more movies*/
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() == $(document).height() && page.number) {

            debug("Scroll to bottom!");

            if (page.mode === "inTheaterMovies") {
                getInTheaterMovies();
            } else {
                searchForMovie(true);
            }

        }
    });


    //Initializing list message
    MoviesView.updateNotification("");

    //--------------------------------------- IN THEATER MOVIES ------------------------------------------
    /**
     * Function that handles the in-theater movies functionality.
     * @name getInTheaterMovies
     **/
    var getInTheaterMovies = function () {

        //Checking if it's the first time getting and loading in-theater movies or just loading the next page
        page.number > 1 ?
            debug("Loading in-theaters movies page %s", page.number) :
            debug("Getting in theater movies!");

        //Hiding message element
        MoviesView.updateNotification("");

        /*Checking if the page.mode is "searchingMovies". If so, it changes the page.mode to "inTheaterMovies"
         and initializing page.number*/
        if (page.mode === "searchingMovies") {
            page.mode = "inTheaterMovies";
            page.number = 1;
            MoviesView.emptyList();
        }

        //Calling the MoviesData.getInTheaterMovies for getting the in-theater movies
        MoviesData.getInTheaterMovies(Settings.API_KEY, Settings.pageLimits.inTheatersPageLimit, page.number, function (response) {

            if (!response.success || response.data.movies.length === 0) {
                MoviesView.updateNotification("No available movie");
                MoviesView.updateResultsInformation(response.data.total + " movies in theater this week!");

            } else {

                //Success results returned. Now listing the movies by calling the addMoviesToList function
                MoviesView.addMoviesToList(response, function (thereIsNextPage) {

                    //Updating the results information
                    MoviesView.updateResultsInformation(response.data.total + " movies in theater this week!");

                    //Checking if there is next page
                    page.number = thereIsNextPage ? page.number + 1 : null;

                    debug("Current page: ", page.number);

                });
            }

        });
    };

    //Entry point of app
    getInTheaterMovies();


    //--------------------------------------- SEARCHING FOR A MOVIE------------------------------------------
    /**
     * Function for searching a movie.
     * This function acts a callback when user starts typing in search input
     * or when user clicks Search button
     * @param loadNextPage {boolean} Flag indicating if it's a new search or just loading the next page of results
     */
    var searchForMovie = function (loadNextPage) {

        //Hiding message element again
        MoviesView.updateNotification("");

        //Reading what user typing
        var stringToSearchFor = $searchInput.val();

        //Checking if it's the first time searching and loading movies or just loading the next page
        loadNextPage ?
            debug("Loading search results page: ", loadNextPage) :
            debug("Searching for movie by the given string: ", stringToSearchFor);

        //Checking if the search input is empty. If it's empty, getting in-theater movies
        if (stringToSearchFor === "") {
            debug("Empty search string!");
            getInTheaterMovies();

        } else {

            /*Checking if there is a new search. If there is, it changes the page.mode to "searchingMovies"
             and initializing page.number*/
            if (page.mode === "inTheaterMovies" || !loadNextPage) {

                debug("Starting new search!");

                page.mode = "searchingMovies";
                MoviesView.emptyList();
                page.number = 1;
            } else {
                debug("Getting the next page of search results. Page: ", page.number);
            }

            //Temporary disabling search input until the search result are returned
            MoviesView.disableSearchInput(true);

            //Calling MoviesData.searchForMovie for requesting the search results
            MoviesData.searchForMovie(Settings.API_KEY, stringToSearchFor, Settings.pageLimits.searchingPageLimit, page.number, function (response) {

                debug("Response from search: ", response);

                if (!response.success || response.data.movies.length === 0) {
                    MoviesView.updateNotification("No results");
                    MoviesView.updateResultsInformation("Found " + response.data.total + " movies searching for '" + stringToSearchFor + "'");

                } else {

                    //Success results returned. Now listing the movies by calling the addMoviesToList function
                    MoviesView.addMoviesToList(response, function (thereIsNextPage) {

                        //Updating results information
                        MoviesView.updateResultsInformation("Found " + response.data.total + " movies searching for '" + stringToSearchFor + "'");

                        //Checking if there is next page
                        page.number = thereIsNextPage ? page.number + 1 : null;

                        debug("Current page: ", page.number);

                    });
                }

                MoviesView.disableSearchInput(false);

            });
        }
    };


    //--------------------------------------- MOVIE DETAILS ------------------------------------------

    /**
     * Variable that holds the id of currently selected movie
     * @type {null}
     */
    var currentlySelectedMovieID = null;

    /**
     * @name toggleMovieDetails
     * @param id {number}
     *
     * Function for showing or hiding selected movie's details.
     * NOTE: Application shown only one movie's details at a time.
     *       If there is already a movie A showing details and the user
     *       clicks to movie B, the movie A will hide it's details
     */
    var toggleMovieDetails = function (id) {

        //Checking if there is already selected movie
        if (currentlySelectedMovieID) {

            //If there is, checking if the user clicked the same
            if (currentlySelectedMovieID === id) {

                //Hiding additional information for te selected movie
                debug("Hiding movie details for ID:", id);
                MoviesView.hideMovieDetails(id);
                currentlySelectedMovieID = null;
            } else {

                /*In this case user clicked a second one so
                 1) Hiding additional information for the old movie
                 2) Showing additional information for the new*/
                debug("Hiding movie details for ID:", currentlySelectedMovieID);
                debug("Showing movie details for ID:", id);
                MoviesView.hideMovieDetails(currentlySelectedMovieID);

                //Requesting for the selected movie's additional info, reviews, similar movies
                movieAdditionalInformationRequest(id, function (responseData) {
                    MoviesView.showMovieDetails(id, responseData);
                    currentlySelectedMovieID = id;
                });

            }

        } else {

            //There is no selected movie. Fetching additional information, reviews, similar movies for the current one
            debug("Showing movie details for ID:", id);
            movieAdditionalInformationRequest(id, function (responseData) {
                MoviesView.showMovieDetails(id, responseData);
                currentlySelectedMovieID = id;
            });
        }
    };

    /**
     * Function getting additional information, reviews, similar movies for the selected movie
     *
     * @name movieAdditionalInformationRequest
     * @param id {number} Selected movie's id
     * @param callback {function(response)} Callback that executes when all 3 requests finish
     */
    var movieAdditionalInformationRequest = function (id, callback) {

        //Show loading
        MoviesView.loading.show();

        $.when(MoviesData.getMovieDetails(Settings.API_KEY, id), MoviesData.getMovieReviews(Settings.API_KEY, id, Settings.pageLimits.movieReviewsPageLimit),
            MoviesData.getSimilarMovies(Settings.API_KEY, id, Settings.pageLimits.similarMoviesPageLimit))
            .done(function (movieDetailsResponse, movieReviewsResponse, similarMoviesResponse) {

                //Hide loading
                MoviesView.loading.hide();

                // Each returned resolve has the following structure: [data, textStatus, jqXHR]

                //Formatting the response
                var formattedResponse = {
                    genres: movieDetailsResponse[0].genres.join(", "),
                    directors: _.pluck(movieDetailsResponse[0].abridged_directors, "name").join(", "),
                    reviews: movieReviewsResponse[0].reviews,
                    similarMovies: similarMoviesResponse[0].movies
                };

                //Calling the callback
                callback(formattedResponse);
            });
    };
});


