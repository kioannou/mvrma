'use strict';

var _ = require("underscore");
var $ = require("jquery");
var Debug = require("debug");
//Define the app.js logger
var debug = Debug("app");
Debug.enable('*');

var MoviesData = require("./moviesData.js");
var MoviesView = require("./moviesView.js");



$(document).ready(function () {

    /**
     * Constant that holds the API key for the requests
     * @type {string}
     */
    var API_KEY = "qtqep7qydngcc7grk4r4hyd9";
    var moviesPageLimit = 10;

    var page = {
        mode: "inTheaterMovies",
        number: 1
    };

    var $moviesList = $('#movies-list');
    var $searchButton = $('#search-button');
    var $searchInput = $('#search-input');


    //Initializing list message
    MoviesView.updateNotification("");

    //--------------------------------------- IN THEATER MOVIES ------------------------------------------

    /**
     *
     */
    var getInTheaterMovies = function () {

        page.number > 1 ?
            debug("Loading in-theaters movies page %s", page.number) :
            debug("Getting in theater movies!");

        //Hiding message element
        MoviesView.updateNotification("");

        if (page.mode === "searchingMovies") {
            page.mode = "inTheaterMovies";
            page.number = 1;
            MoviesView.emptyList();
        }

        MoviesData.getInTheaterMovies(API_KEY, moviesPageLimit, page.number, function (response) {

            if (!response.success || response.data.movies.length === 0) {
                MoviesView.updateNotification("No available movie");
                MoviesView.updateResultsInformation(response.data.total + " movies in theater this week!");

            } else {
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

    //Entry point of app
    getInTheaterMovies();


    //--------------------------------------- SEARCH ------------------------------------------

    //Function for searching for a movie
    var searchForMovie = function (loadNextPage) {

        //Hiding message element again
        MoviesView.updateNotification("");

        var stringToSearchFor = $searchInput.val();

        loadNextPage ?
            debug("Loading search results page: ", loadNextPage) :
            debug("Searching for movie by the given string: ", stringToSearchFor);


        if (stringToSearchFor === "") {
            debug("Empty search string!");
            getInTheaterMovies();

        } else {

            //Checking if there is a new search
            if (page.mode === "inTheaterMovies" || !loadNextPage) {

                debug("Starting new search!");

                page.mode = "searchingMovies";
                MoviesView.emptyList();
                page.number = 1;
            } else {
                debug("Getting the next page of search results. Page: ", page.number);
            }

            MoviesData.searchForMovie(API_KEY, stringToSearchFor, moviesPageLimit, page.number, function (response) {

                debug("Response from search: ", response);

                if (!response.success || response.data.movies.length === 0) {
                    MoviesView.updateNotification("No results");
                    MoviesView.updateResultsInformation("Found " + response.data.total + " movies searching for '" + stringToSearchFor + "'");

                } else {
                    MoviesView.addMoviesToList(response, function (thereIsNextPage) {

                        //Updating results information
                        MoviesView.updateResultsInformation("Found " + response.data.total + " movies searching for '" + stringToSearchFor + "'");

                        //Checking if there is next page
                        page.number = thereIsNextPage ? page.number + 1 : null;

                        debug("Current page: ", page.number);

                    });
                }
            });
        }
    };

    //Bind event on Button for searching a movie
    $searchButton.on("click", function () {
        searchForMovie(false);
    });


    $searchInput.keyup(function () {

        var s = $searchInput.val();

        setTimeout(function () {
            if ($searchInput.val() == s) {
                // Check the value searched is the latest one or not.
                // This will help in making the ajax call work when client stops writing.
                searchForMovie(false);
            }
        }, 500); // 1 sec delay to check.
    }); // End of keyup function


    //--------------------------------------- MOVIE DETAILS ------------------------------------------

    var currentlySelectedMovieID = null;

    //Assigning event for toggling movie details
    $moviesList.on("click", "div.movies-item", function (e) {
        var newlySelectedMovieID = $(this).attr('id');
        debug("Clicked id:", newlySelectedMovieID);
        e.stopPropagation();

        toggleMovieDetails(newlySelectedMovieID);
    });

    //Function for toggling details
    var toggleMovieDetails = function (id) {
        if (currentlySelectedMovieID) {

            if (currentlySelectedMovieID === id) {
                debug("Hiding movie details for ID:", id);
                MoviesView.hideMovieDetails(id);
                currentlySelectedMovieID = null;
            } else {
                debug("Hiding movie details for ID:", currentlySelectedMovieID);
                debug("Showing movie details for ID:", id);
                MoviesView.hideMovieDetails(currentlySelectedMovieID);

                movieAdditionalInformationRequest(id, function (responseData) {
                    MoviesView.showMovieDetails(id, responseData);
                    currentlySelectedMovieID = id;
                });

            }

        } else {
            debug("Showing movie details for ID:", id);
            movieAdditionalInformationRequest(id, function (responseData) {
                MoviesView.showMovieDetails(id, responseData);
                currentlySelectedMovieID = id;
            });
        }
    };


    //Defining parameters for the API call
    var similarMoviesPageLimit = 3;
    var movieReviewsPageLimit = 2;

    //Function for get all the additional movie information
    var movieAdditionalInformationRequest = function (id, callback) {

        //Loading
        MoviesView.loading.show();

        $.when(MoviesData.getMovieDetails(API_KEY, id), MoviesData.getMovieReviews(API_KEY, id, movieReviewsPageLimit), MoviesData.getSimilarMovies(API_KEY, id, similarMoviesPageLimit))
            .done(function (movieDetailsResponse, movieReviewsResponse, similarMoviesResponse) {

                //Loading
                MoviesView.loading.hide();

                // Each returned resolve has the following structure: [data, textStatus, jqXHR]

                //Formatting the response
                var formattedResponse = {
                    genres: movieDetailsResponse[0].genres.join(", "),
                    directors: _.pluck(movieDetailsResponse[0].abridged_directors, "name").join(", "),
                    reviews: movieReviewsResponse[0].reviews,
                    similarMovies: similarMoviesResponse[0].movies
                };

                callback(formattedResponse);
            });
    };


});


