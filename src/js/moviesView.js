/**
 * @module {Module} src/js/moviesView.js
 *
 * This module contains and exports all the DOM manipulation functions
 */

"use strict";

var $ = require("jquery");
var _ = require("underscore");
var Debug = require("debug");
//Define the app.js logger
var debug = Debug("moviesView");
Debug.enable('*');

/*Caching all the jQuery selectors*/
var $moviesList = $('#movies-list');
var $resultsInformation = $('#results-information');
var $notification = $('#notification');
var $body = $("body");
var $searchInput = $('#search-input');

/**
 * Function that accepts an object which is the response from
 * @param response
 * @param callback
 */
exports.addMoviesToList = function (response, callback) {

    debug("Listing movies...");

    //Error on fetching
    if (!response.success) {
        debug("There was an error on fetching the movies!");
        callback({
            success: false
        });
    }

    if (response.success) {
        //Loading each new movie
        _.each(response.data.movies, function (movie, key, list) {

            debug("Adding movie: ", movie.title);

            //Checking if information about movie's cast exists and
            var movieCastElement = "";
            if (movie.abridged_cast.length > 0) {
                movieCastElement = '<p> Starring ' + _.pluck(movie.abridged_cast, "name").join(", ") + '</p> ';
            } else {
                movieCastElement = "<p class='unavailable'> No information about movie's cast</p> ";
            }

            //Adding the element
            $moviesList.append(
                '<div class="movies-item row" id="' + movie.id + '"> ' +
                '<div class="container"> ' + //Adding similar here, Adding reviews here
                '<div class="media"> ' + //col-sm-8
                '<div class="media-left"> ' +
                '<a href="#"> ' +
                '<img class="media-object" src="' + movie.posters.detailed + '"> ' +
                '</a> ' +
                '</div> ' +
                '<div class="media-body"> ' +
                '<h5 class="media-heading">' + movie.title + '</h5> ' + //Movie's title
                '<p>' + movie.year//Movie's year
                + (movie.year && movie.runtime ? " - " : "") //Checking if the " - " is necessary
                + (movie.runtime ? movie.runtime + ' mins' : "")
                + ' </p> '//Checking if movie runtime exists
                + movieCastElement + //Adding the movie's cast
                '<p class="genres"></p>' +
                '<p class="directors"></p>' +
                '<p>Audience rating: ' + movie.ratings.audience_score + '/100, Critics rating: ' + movie.ratings.critics_score + '/100</p> ' + //Ratings
                '<p>' + movie.synopsis + '</p> ' + //Movie's synopsis
                '</div> ' +
                '</div> ' +
                '</div> ' +
                '</div>'
            );

        });

        callback(response.data.next);
    }
};

/**
 * Function for empty the movie's list
 * @name emptyList
 */
exports.emptyList = function () {
    $moviesList.empty();
};


/**
 * Function that adds the selected movie's additional information, similar movies,
 * movie's reviews elements
 *
 * @name showMovieDetails
 * @param id {number}
 * @param data {object}
 */
exports.showMovieDetails = function (id, data) {

    debug("Selected movie to show: ", id);

    //Dynamically caching the movies selector
    var $selectedMovieElement = $("#" + id);

    //Changing background color
    $selectedMovieElement.css("background-color", "aliceblue");

    //Add movie genres
    $("#" + id + ' .genres').text( data.genres ? "Genre: "+data.genres : "No genre");

    //Add directors
    $("#" + id + ' .directors').text(data.directors ? "Director(s): "+data.directors : "Unknown director(s)");


    //Adding the parent element
    $("#" + id + ' .container')
        .append('<div class="reviews col-sm-4">'
            + '<div class="reviews-title"><h5>Latest Reviews</h5></div>'
            +'</div>');


    //Add reviews
    if (data.reviews.length > 0) {

        //Adding column class to .media
        $("#" + id + ' .media').addClass("col-sm-8");

        _.each(data.reviews, function (review, key, list) {
            $("#" + id + ' .reviews').append(
                '<p class="review-item">'
                + review.quote
                    +'<br><span class="review-info">'+ review.critic +' | '+ review.date +'</span>'
                + '</p>'

            );
        });
    } else {
        //Message no reviews available

        //Adding column class to .media
        $("#" + id + ' .media').addClass("col-sm-8");
        $("#" + id + ' .reviews').append("<div class='unavailable no-reviews-notification'>The are no reviews available</div>");
    }


    //Adding the parent element for similar movies
    $("#" + id + ' .media-body')
    .append('<div class="similar-movies"></div>');


    var similarMoviesArray = [];

    //Add similar movies
    if (data.similarMovies.length > 0) {
        _.each(data.similarMovies, function (similarMovie, key, list) {
            similarMoviesArray.push('<a href="https://www.rottentomatoes.com/">' + similarMovie.title + '</a>')
        });

        //Append the final element
        $("#" + id + ' .similar-movies').append(
            '<span>Similar movies: ' + similarMoviesArray.join(",  ") + '</span>'
        );

    } else {
        //Message no similar movies available
        $("#" + id + ' .similar-movies').text("No available similar movies").addClass("unavailable");

    }

};

/**
 * Function that hides the selected movie's additional information, similar movies,
 * movie's reviews elements
 *
 * @name hideMovieDetails
 * @param id {number} Selected movie's id
 */
exports.hideMovieDetails = function (id) {

    debug("Selected element to hide: ", id);

    //Dynamically caching the movies selector
    var $selectedMovieElement = $("#" + id);

    //Changing background color
    $selectedMovieElement.css("background-color", "white");

    //Removing movie genres
    $("#" + id + ' .genres').text("");

    //Removing directors
    $("#" + id + ' .directors').text("");

    //Removing column class to .media
    $("#" + id + ' .media').removeClass("col-sm-8");

    //Removing the parent element
    $("#" + id + ' .reviews').empty().remove();

    //Removing similar movies
    $("#" + id + ' .similar-movies').text("").remove();

};


/**
 * Function that updates the '#results-information' element
 *
 * @name updateResultsInformation
 * @param resultsString {string} String to update the '#results-information' element
 */
exports.updateResultsInformation = function (resultsString) {
    $resultsInformation.text(resultsString);
};

/**
 * Function that updates the '#notification' element
 *
 * @name updateNotification
 * @param message {string} String to update the '#notification' element
 */
exports.updateNotification = function(message){
        $notification.text(message);
};

/**
 * Functions that control the loading visual effect.
 * loading.show: Shows loading
 * loading.hide: Hides loading
 *
 * @type {{show: exports.loading.show, hide: exports.loading.hide}}
 */
exports.loading = {
    show: function(){
        $body.addClass("loading");
    },
    hide: function () {
        $body.removeClass("loading");
    }
};

/**
 * Function that disables/enables the '#search-input' element.
 * When the user types a string in '#search-input'
 * an ajax request takes place returning the search results for the string
 * While there is an ongoing ajax request,
 * user should not be able to type something until request finishes
 *
 * @param choice {boolean}
 */
exports.disableSearchInput = function (choice) {
    $searchInput.prop('readonly', choice);
};


