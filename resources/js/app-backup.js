'use strict';

var _ = require("underscore");
var $ = require("jquery");

var MoviesData = require("./moviesData.js");

$(document).ready(function () {

    //Movies in theater parameters
    var API_KEY = "qtqep7qydngcc7grk4r4hyd9";
    var moviesBatchSize = 10;

    var page = {
        type: "new",
        number: 1
    };

    var $moviesList = $('#movies-list');

    var $searchButton = $('#search-button');
    var $searchInput = $('#search-input');

    //Load-more-movies indicator
    var $loadMoreMoviesIndicator = $('#loading-more-indicator');
    $loadMoreMoviesIndicator.toggle(true);


    //Function for listing the movies
    var listMovies = function (response) {

        console.warn("Listing movies!");

        //Error on fetching
        if (!response.success) {
            console.log("There was an error on fetching the movies");
        }

        if (response.success) {
            //Loading each new movie
            _.each(response.data.movies, function (movie, key, list) {

                console.log("movie: ", movie .title);

                //Checking cast
                var movieCastElement = "";
                if (movie.abridged_cast.length > 0) {
                    movieCastElement = '<p> Starring ' + _.pluck(movie.abridged_cast, "name").join(", ") + '</p> ';
                } else {
                    movieCastElement = "<p class='unavailable'> No information about movie's cast</p> ";
                }

                //Adding the element
                $moviesList.append(
                    '<div class="movies-item row" id="' + movie.id + '"> ' +
                    '<div id="' + movie.id + '-container"> ' + //col-md-8
                    '<div class="media"> ' +
                    '<div class="media-left"> ' +
                    '<a href="#"> ' +
                    '<img class="media-object" src="' + movie.posters.detailed + '"> ' +
                    '</a> ' +
                    '</div> ' +
                    '<div class="media-body"> ' +
                    '<h5 class="media-heading">' + movie.title + '</h5> ' +
                    '<p>' + movie.year +
                    ' - ' + movie.runtime + ' mins</p> ' +
                    movieCastElement +
                    '<p>Audience rating: ' + movie.ratings.audience_score + '/100, Critics rating: ' + movie.ratings.critics_score + '/100</p> ' +
                    '<p>' + movie.synopsis + '</p> ' +
                    '</div> ' +
                    '</div> ' +
                    '</div> ' +
                    '</div>'
                );

            });

            //Checking if there is next page
            page.number = response.data.next ? page.number + 1 : null;
            console.log("Current page: ", page.number);
        }
    };


    //--------------------------------------- IN THEATER MOVIES ------------------------------------------

    //Function for getting in theater movies
    var getInTheaterMovies = function () {

        console.warn("Getting in theater movies!");

        if (page.type === "search") {
            page.type = "new";
            page.number = 1;
            $moviesList.empty();
        }

        MoviesData.getInTheaterMovies(API_KEY, moviesBatchSize, page.number, listMovies);
    };


    //Event for when the users scrolls to the bottom
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {

            console.warn("Scroll to the bottom!");

            if(page.type === "new"){
                getInTheaterMovies();
            }else{
                searchForMovie(true);
            }

        }
    });

    //Entry point of app
    console.log("Entry point!");
    getInTheaterMovies();


    //--------------------------------------- SEARCH ------------------------------------------

    //Function for searching for a movie
    var searchForMovie = function (loadNextPage) {

        var stringToSearchFor = $searchInput.val();

        if (stringToSearchFor === "") {
            console.warn("Empty search string!");
            return getInTheaterMovies();
        }

        if (page.type === "new" || !loadNextPage) {
            page.type = "search";
            $moviesList.empty();
            page.number = 1;
        }

        MoviesData.searchForMovie(API_KEY, stringToSearchFor, moviesBatchSize, page.number, listMovies);
    };

    //Bind event on Button for searching a movie
    $searchButton.on("click",function(){
        searchForMovie(false);
    });

    //Bind event on typing for searching a movie
    $searchInput.on("keyup",function(){
        searchForMovie(false);
    });


    //--------------------------------------- MOVIE DETAILS ------------------------------------------



});


