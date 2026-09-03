const openBookButton =
    document.querySelector(".open-book-btn");

const closeBookButton =
    document.querySelector(".close-book-btn");

const bookCover =
    document.querySelector(".book-cover");

const addDishButton =
    document.querySelector(".add-dish-btn");

const addDishScreen =
    document.querySelector(".add-dish-screen");

const closeAddDishButton =
    document.querySelector(".close-add-dish");

const recipeForm =
    document.querySelector("#recipe-form");

const recipeDisplay =
    document.querySelector(".recipe-display");

const recipeIndexList =
    document.querySelector(".recipe-index-list");

const previousRecipeButton =
    document.querySelector(".previous-recipe-btn");

const nextRecipeButton =
    document.querySelector(".next-recipe-btn");

const recipePageNumber =
    document.querySelector(".recipe-page-number");

const indexPage =
    document.querySelector(".index-page");


// =====================================================
// FORM ELEMENTS
// =====================================================

const recipeNameInput =
    document.querySelector("#recipe-name");

const recipeCategoryInput =
    document.querySelector("#recipe-category");

const recipeImageInput =
    document.querySelector("#recipe-image");

const recipeIngredientsInput =
    document.querySelector("#recipe-ingredients");

const recipeInstructionsInput =
    document.querySelector("#recipe-instructions");

const saveRecipeButton =
    document.querySelector(".save-recipe-btn");


// =====================================================
// RECIPE DATA
// =====================================================

let recipes =
    JSON.parse(
        localStorage.getItem("sujiRecipes")
    ) || [];


// =====================================================
// CURRENT PAGE
// =====================================================

// -1 = Contents
//  0 = first recipe
//  1 = second recipe
//  etc.

let currentRecipeIndex = -1;


// =====================================================
// EDIT MODE
// =====================================================

let editingRecipeIndex = null;


// =====================================================
// OPEN BOOK
// =====================================================

openBookButton.addEventListener("click", function () {

    bookCover.classList.add("open");

    showContents();

});


// =====================================================
// CLOSE BOOK — CONTENTS PAGE
// =====================================================

closeBookButton.addEventListener("click", function () {

    bookCover.classList.remove("open");

});


// =====================================================
// ADD DISH
// =====================================================

addDishButton.addEventListener("click", function () {

    editingRecipeIndex = null;

    prepareFormForNewRecipe();

    addDishScreen.style.display = "block";

});


// =====================================================
// CLOSE ADD DISH
// =====================================================

closeAddDishButton.addEventListener("click", function () {

    addDishScreen.style.display = "none";

    editingRecipeIndex = null;

    prepareFormForNewRecipe();

});


// =====================================================
// PREPARE FORM FOR NEW RECIPE
// =====================================================

function prepareFormForNewRecipe() {

    recipeForm.reset();

    saveRecipeButton.textContent =
        "Save to my cookbook ♡";

}


// =====================================================
// EDIT RECIPE
// =====================================================

function editRecipe(index) {

    const recipe =
        recipes[index];

    if (!recipe) {
        return;
    }


    editingRecipeIndex = index;


    // Fill the form

    recipeNameInput.value =
        recipe.title || "";


    recipeCategoryInput.value =
        recipe.category || "";


    recipeIngredientsInput.value =
        (recipe.ingredients || []).join("\n");


    recipeInstructionsInput.value =
        (recipe.instructions || []).join("\n");




    recipeImageInput.value = "";


    saveRecipeButton.textContent =
        "Update my recipe ♡";


    addDishScreen.style.display =
        "block";

}


// =====================================================
// SAVE / UPDATE RECIPE
// =====================================================

recipeForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // =================================================
    // GET FORM VALUES
    // =================================================

    const name =
        recipeNameInput.value.trim();


    const category =
        recipeCategoryInput.value;


    const ingredientsText =
        recipeIngredientsInput.value.trim();


    const instructionsText =
        recipeInstructionsInput.value.trim();


    const imageFile =
        recipeImageInput.files[0];


    // =================================================
    // TURN TEXT INTO ARRAYS
    // =================================================

    const ingredients =
        ingredientsText
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "");


    const instructions =
        instructionsText
            .split("\n")
            .map(item => item.trim())
            .filter(item => item !== "");


    // =================================================
    // EDITING EXISTING RECIPE
    // =================================================

    if (editingRecipeIndex !== null) {

        const oldRecipe =
            recipes[editingRecipeIndex];


        const updatedRecipe = {

            id: oldRecipe.id,

            title: name,

            category: category,

            ingredients: ingredients,

            instructions: instructions,

            favourite: false,

            image: oldRecipe.image || ""

        };


        // ---------------------------------------------
        // NEW IMAGE SELECTED
        // ---------------------------------------------

        if (imageFile) {

            const reader =
                new FileReader();


            reader.onload = function () {

                updatedRecipe.image =
                    reader.result;


                recipes[editingRecipeIndex] =
                    updatedRecipe;


                finishEditing();

            };


            reader.readAsDataURL(imageFile);

        } else {

            recipes[editingRecipeIndex] =
                updatedRecipe;


            finishEditing();

        }


        return;

    }


    // =================================================
    // CREATE NEW RECIPE
    // =================================================

    const newRecipe = {

        id: Date.now(),

        title: name,

        category: category,

        ingredients: ingredients,

        instructions: instructions,

        favourite: false,

        image: ""

    };


    // =================================================
    // NEW RECIPE IMAGE
    // =================================================

    if (imageFile) {

        const reader =
            new FileReader();


        reader.onload = function () {

            newRecipe.image =
                reader.result;


            saveNewRecipe(newRecipe);

        };


        reader.readAsDataURL(imageFile);

    } else {

        saveNewRecipe(newRecipe);

    }

});


// =====================================================
// SAVE NEW RECIPE
// =====================================================

function saveNewRecipe(recipe) {

    recipes.push(recipe);


    localStorage.setItem(
        "sujiRecipes",
        JSON.stringify(recipes)
    );


    currentRecipeIndex =
        recipes.length - 1;


    editingRecipeIndex = null;


    addDishScreen.style.display =
        "none";


    recipeForm.reset();


    saveRecipeButton.textContent =
        "Save to my cookbook ♡";


    displayCurrentRecipe();

}


// =====================================================
// FINISH EDITING
// =====================================================

function finishEditing() {

    localStorage.setItem(
        "sujiRecipes",
        JSON.stringify(recipes)
    );


    currentRecipeIndex =
        editingRecipeIndex;


    editingRecipeIndex = null;


    addDishScreen.style.display =
        "none";


    recipeForm.reset();


    saveRecipeButton.textContent =
        "Save to my cookbook ♡";


    displayCurrentRecipe();

}


// =====================================================
// SHOW CONTENTS
// =====================================================

function showContents() {

    currentRecipeIndex = -1;


    indexPage.style.display =
        "flex";


    recipeDisplay.style.display =
        "none";




    closeBookButton.style.display =
        "block";


    recipePageNumber.textContent =
        "Contents";


    previousRecipeButton.disabled =
        true;


    nextRecipeButton.disabled =
        recipes.length === 0;


    renderRecipeIndex();

}


// =====================================================
// RENDER CONTENTS
// =====================================================

function renderRecipeIndex() {

    if (recipes.length === 0) {

        recipeIndexList.innerHTML = `

            <div class="empty-index">

                <span>🍓</span>

                <p>
                    Your recipes will appear here ♡
                </p>

            </div>

        `;

        return;

    }


    recipeIndexList.innerHTML =
        recipes
            .map((recipe, index) => {

                return `

                    <div class="recipe-index-item">

                        <button
                            class="recipe-index-open"
                            type="button"
                            data-index="${index}"
                        >

                            <span class="recipe-number">
                                ${String(index + 1).padStart(2, "0")}
                            </span>


                            <span class="recipe-index-info">

                                <strong>
                                    ${recipe.title}
                                </strong>

                                <small>
                                    ${recipe.category}
                                </small>

                            </span>


                            <span class="recipe-arrow">
                                →
                            </span>

                        </button>


                        <button
                            class="delete-recipe-btn"
                            type="button"
                            data-index="${index}"
                            aria-label="Delete recipe"
                        >
                            ×
                        </button>

                    </div>

                `;

            })
            .join("");


    // =================================================
    // OPEN RECIPE FROM CONTENTS
    // =================================================

    document
        .querySelectorAll(".recipe-index-open")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    currentRecipeIndex =
                        Number(this.dataset.index);

                    displayCurrentRecipe();

                }
            );

        });


    // =================================================
    // DELETE FROM CONTENTS
    // =================================================

    document
        .querySelectorAll(".delete-recipe-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(this.dataset.index);


                    deleteRecipe(index);

                }
            );

        });

}


// =====================================================
// DELETE RECIPE
// =====================================================

function deleteRecipe(index) {

    const recipe =
        recipes[index];


    if (!recipe) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${recipe.title}" from your cookbook?`
        );


    if (!confirmed) {
        return;
    }


    recipes.splice(index, 1);


    localStorage.setItem(
        "sujiRecipes",
        JSON.stringify(recipes)
    );




    if (recipes.length === 0) {

        showContents();

        return;

    }




    if (
        currentRecipeIndex >=
        recipes.length
    ) {

        currentRecipeIndex =
            recipes.length - 1;

    }


    showContents();

}


// =====================================================
// DISPLAY CURRENT RECIPE
// =====================================================

function displayCurrentRecipe() {

    if (recipes.length === 0) {

        showContents();

        return;

    }


    

    if (
        currentRecipeIndex < 0 ||
        currentRecipeIndex >= recipes.length
    ) {

        showContents();

        return;

    }


    indexPage.style.display =
        "none";


    recipeDisplay.style.display =
        "block";




    closeBookButton.style.display =
        "none";


    const recipe =
        recipes[currentRecipeIndex];


    // =================================================
    // IMAGE
    // =================================================

    let imageHTML = "";


    if (recipe.image) {

        imageHTML = `

            <img
                class="recipe-image"
                src="${recipe.image}"
                alt="${recipe.title}"
            >

        `;

    }


    // =================================================
    // RECIPE CONTENT
    // =================================================

    recipeDisplay.innerHTML = `

        <span class="recipe-category">
            ${recipe.category}
        </span>


        <h3 class="recipe-title">
            ${recipe.title}
        </h3>


        ${imageHTML}


        <div class="recipe-divider"></div>


        <h4>
            Ingredients
        </h4>


        <ul class="recipe-ingredients">

            ${(recipe.ingredients || [])
                .map(ingredient => `
                    <li>
                        ${ingredient}
                    </li>
                `)
                .join("")}

        </ul>


        <h4>
            Instructions
        </h4>


        <ol class="recipe-instructions">

            ${(recipe.instructions || [])
                .map(step => `
                    <li>
                        ${step}
                    </li>
                `)
                .join("")}

        </ol>


        <!-- =========================================
             RECIPE ACTIONS
             ========================================= -->

        <div class="recipe-actions">

            <button
                class="edit-recipe-btn"
                type="button"
            >
                Edit Recipe ✎
            </button>


            <button
                class="delete-current-recipe-btn"
                type="button"
            >
                Delete Recipe ×
            </button>

        </div>


        <!-- =========================================
             CLOSE COOKBOOK
             INSIDE SCROLLABLE RECIPE
             ========================================= -->

        <div class="recipe-close-wrapper">

            <button
                class="recipe-close-book-btn"
                type="button"
            >
                Close Cookbook ♡
            </button>

        </div>

    `;


    // =================================================
    // EDIT BUTTON
    // =================================================

    const editButton =
        recipeDisplay.querySelector(
            ".edit-recipe-btn"
        );


    editButton.addEventListener(
        "click",
        function () {

            editRecipe(currentRecipeIndex);

        }
    );


    // =================================================
    // DELETE BUTTON
    // =================================================

    const deleteButton =
        recipeDisplay.querySelector(
            ".delete-current-recipe-btn"
        );


    deleteButton.addEventListener(
        "click",
        function () {

            deleteRecipe(currentRecipeIndex);

        }
    );


    // =================================================
    // CLOSE BUTTON — RECIPE PAGE
    // =================================================

    const recipeCloseButton =
        recipeDisplay.querySelector(
            ".recipe-close-book-btn"
        );


    recipeCloseButton.addEventListener(
        "click",
        function () {

            bookCover.classList.remove("open");

        }
    );


    // =================================================
    // PAGE NUMBER
    // =================================================

    recipePageNumber.textContent =
        `${currentRecipeIndex + 1} / ${recipes.length}`;


    // =================================================
    // PREVIOUS
    // =================================================

    previousRecipeButton.disabled =
        false;


    // =================================================
    // NEXT
    // =================================================

    nextRecipeButton.disabled =
        currentRecipeIndex ===
        recipes.length - 1;


    // =================================================
    // RESET RECIPE SCROLL
    // =================================================

    recipeDisplay.scrollTop = 0;

}


// =====================================================
// PREVIOUS BUTTON
// =====================================================

previousRecipeButton.addEventListener(
    "click",
    function () {

        // ---------------------------------------------
        // FIRST RECIPE → CONTENTS
        // ---------------------------------------------

        if (currentRecipeIndex === 0) {

            showContents();

            return;

        }


        // ---------------------------------------------
        // OTHER RECIPES → PREVIOUS RECIPE
        // ---------------------------------------------

        if (currentRecipeIndex > 0) {

            currentRecipeIndex--;

            displayCurrentRecipe();

        }

    }
);


// =====================================================
// NEXT BUTTON
// =====================================================

nextRecipeButton.addEventListener(
    "click",
    function () {

        // ---------------------------------------------
        // CONTENTS → FIRST RECIPE
        // ---------------------------------------------

        if (currentRecipeIndex === -1) {

            if (recipes.length > 0) {

                currentRecipeIndex = 0;

                displayCurrentRecipe();

            }

            return;

        }


        // ---------------------------------------------
        // NEXT RECIPE
        // ---------------------------------------------

        if (
            currentRecipeIndex <
            recipes.length - 1
        ) {

            currentRecipeIndex++;

            displayCurrentRecipe();

        }

    }
);


// =====================================================
// START APP
// =====================================================

showContents();

/* =====================================================
   RECIPE SEARCH
   ===================================================== */

const recipeSearch = document.querySelector("#recipe-search");

if (recipeSearch) {

    recipeSearch.addEventListener("input", function () {

        const searchTerm = this.value
            .toLowerCase()
            .trim();

        const recipeItems =
            document.querySelectorAll(".recipe-index-item");

        recipeItems.forEach(function (item) {

            const recipeText =
                item.textContent.toLowerCase();

            if (recipeText.includes(searchTerm)) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }

        });

    });

}