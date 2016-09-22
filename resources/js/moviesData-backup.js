/**
 * This file contains all the functions regarding
 */

var $ = require("jquery");
var MoviesView = require("./moviesView.js");
var Debug = require("debug");
//Define the app.js logger
var debug = Debug("moviesData");
Debug.enable('*');

"use strict";

/**
 *
 * @param apiKey
 * @param pageLimit
 * @param page
 * @param callback
 */
exports.getInTheaterMovies = function (apiKey, pageLimit, page, callback) {

    //Loading
    MoviesView.loading.show();

    debug("Requesting for movies in theater");

    $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=' + apiKey + '&page_limit=' + pageLimit + '&page=' + page,
        dataType: 'jsonp',
        success: function (response) {

            debug("Success on getting the movies in theater");

            //Loading
            MoviesView.loading.hide();

            //Formatting the response in a template that is useful for me
            var formattedResponse = {
                movies: response.movies,
                total: response.total,
                next: response.links.next ? response.links.next : null
            };

            return callback({
                success: true,
                data: formattedResponse
            });
        },
        error: function () {

            debug("Error on getting the movies in theater");

            //Loading
            MoviesView.loading.hide();

            return callback({
                success: false,
                data: {}
            });
        }
    });
};


//Search for a movie function
/**
 *
 * @type {null}
 */
var ongoingSearchRequest = null;

/**
 *
 * @type {null}
 */
var requestTimer = null;

/**
 *
 * @param apiKey
 * @param stringForSearch
 * @param pageLimit
 * @param page
 * @param callback
 */
exports.searchForMovie = function (apiKey, stringForSearch, pageLimit, page, callback) {

    debug("Requesting search for %s", stringForSearch);

    //New search request - Aborting existing one
    if (ongoingSearchRequest !== null) {
        debug("Aborting search request for %s", stringForSearch);
        ongoingSearchRequest.abort();
        //clearTimeout(requestTimer);
    }

    //Loading
    MoviesView.loading.show();

    //requestTimer = setTimeout(function(){


        ongoingSearchRequest = $.ajax({
            type: 'GET',
            url: 'http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=' + apiKey + '&q=' + stringForSearch + '&page_limit=' + pageLimit + '&page=' + page,
            dataType: 'jsonp',
            success: function (response) {

                debug("Success on search request for %s", stringForSearch);
                debug("Response", response);

                //Loading
                MoviesView.loading.hide();

                //Formatting the response in a template that is useful for me
                var formattedResponse = {
                    movies: response.movies,
                    total: response.total,
                    next: response.links.next ? response.links.next : null
                };

                return callback({
                    success: true,
                    data: formattedResponse
                });
            },
            error: function () {

                debug("Error on search request for %s", stringForSearch);

                //Loading
                MoviesView.loading.hide();

                return callback({
                    success: false,
                    data: {}
                });
            }
        });
    //}, 500);
};

/**
 *
 * @param apiKey
 * @param id
 * @returns {*}
 */
exports.getMovieDetails = function (apiKey, id) {

    debug("Getting movie details for the movie with id: ", id);

    return $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '.json?apikey=' + apiKey,
        dataType: 'jsonp'
    });
};

/**
 *
 * @param apiKey
 * @param id
 * @param pageLimit
 * @returns {*}
 */
exports.getMovieReviews = function (apiKey, id, pageLimit) {

    debug("Getting movie reviews for the movie with id: ", id);

    return $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '/reviews.json?apikey=' + apiKey + '&page_limit=' + pageLimit,
        dataType: 'jsonp'
    });
};

/**
 *
 * @param apiKey
 * @param id
 * @param pageLimit
 * @returns {*}
 */
exports.getSimilarMovies = function (apiKey, id, pageLimit) {

    debug("Getting similar movies for the movie with id: ", id);

    return $.ajax({
        type: 'GET',
        url: 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + id + '/similar.json?apikey=' + apiKey + '&page_limit=' + pageLimit,
        dataType: 'jsonp'
    });
};


