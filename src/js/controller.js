import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; // Transpiling
import 'regenerator-runtime/runtime'; // Polyfilling

const controlRecipes = async function () {
  try {
    // 1) Get recipe id ->
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // 2) Update results view to mark selected search result ->
    resultsView.update(model.getSearchResultsPage());

    // 3) Update bookmarks view to mark the selected recipe ->
    bookmarksView.update(model.state.bookmarks);

    // 4) Loading recipe ->
    await model.loadRecipe(id);

    // 5) Rendering recipe ->
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1) Get search query ->
    const query = searchView.getQuery();

    if (!query) return;

    resultsView.renderSpinner();

    // 2) Loading search results ->
    await model.loadSearchResults(query);

    // 3) Render results ->
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons ->
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err.message);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results ->
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons ->
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1) Update the recipe servings (in state) ->
  model.updateServings(newServings);

  // 2) Update the recipeView ->
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark ->
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view ->
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (recipe) {
  try {
    addRecipeView.renderSpinner();

    // 1) Upload the new recipe data ->
    await model.uploadRecipe(recipe);

    // 2) Render the new recipe ->
    recipeView.render(model.state.recipe);

    // 3) Render SUCCESS message ->
    addRecipeView.renderMessage();

    // 4) Render bookmark view ->
    bookmarksView.render(model.state.bookmarks);

    // 5) Change ID in URL ->
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 6) Close form window ->
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
