/**
 * Object that holds the page limits for each ajax request
 * @type {{inTheatersPageLimit: number, searchingPageLimit: number, similarMoviesPageLimit: number, movieReviewsPageLimit: number}}
 */
exports.pageLimits = {
    inTheatersPageLimit : 10,
    searchingPageLimit : 10,
    similarMoviesPageLimit : 3,
    movieReviewsPageLimit : 2
};

/**
 * The application api key - required by RT
 * @type {string}
 */
const API_KEY = "qtqep7qydngcc7grk4r4hyd9";
exports.API_KEY = API_KEY;