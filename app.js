const API_URL =
    "https://qu0fkg2jii.execute-api.eu-west-2.amazonaws.com";

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

let recipes = [];

let currentRecipeIndex = -1;

let editingRecipeIndex = null;


async function loadRecipes() {

    try {

        const response =
            await fetch(`${API_URL}/recipes`);

        if (!response.ok) {
            throw new Error("Failed to load recipes");
        }

        const data =
            await response.json();

        recipes =
            data.recipes || [];

        showContents();

    } catch (error) {

        console.error(
            "Failed to load recipes:",
            error
        );

        recipes = [];

        showContents();

    }

}


openBookButton.addEventListener("click", function () {

    bookCover.classList.add("open");

    showContents();

});


closeBookButton.addEventListener("click", function () {

    bookCover.classList.remove("open");

});


addDishButton.addEventListener("click", function () {

    editingRecipeIndex = null;

    prepareFormForNewRecipe();

    addDishScreen.style.display = "block";

});


closeAddDishButton.addEventListener("click", function () {

    addDishScreen.style.display = "none";

    editingRecipeIndex = null;

    prepareFormForNewRecipe();

});


function prepareFormForNewRecipe() {

    recipeForm.reset();

    saveRecipeButton.textContent =
        "Save to my cookbook ♡";

}


function editRecipe(index) {

    const recipe =
        recipes[index];

    if (!recipe) {
        return;
    }

    editingRecipeIndex = index;

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


async function uploadImage(recipeId, imageFile) {

    const uploadResponse =
        await fetch(
            `${API_URL}/recipes/${recipeId}/image-upload`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contentType: imageFile.type
                })
            }
        );

    if (!uploadResponse.ok) {
        throw new Error("Failed to get image upload URL");
    }

    const uploadData =
        await uploadResponse.json();

    const s3Response =
        await fetch(
            uploadData.uploadUrl,
            {
                method: "PUT",
                headers: {
                    "Content-Type": imageFile.type
                },
                body: imageFile
            }
        );

    if (!s3Response.ok) {
        throw new Error("Failed to upload image to S3");
    }

    return uploadData.imageKey;

}


recipeForm.addEventListener("submit", async function (event) {

    event.preventDefault();

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


    if (editingRecipeIndex !== null) {

        const oldRecipe =
            recipes[editingRecipeIndex];

        try {

            let imageKey =
                oldRecipe.imageKey || "";

            if (imageFile) {

                imageKey =
                    await uploadImage(
                        oldRecipe.recipeId,
                        imageFile
                    );

            }

            const updatedRecipe = {

                title: name,

                category: category,

                ingredients: ingredients,

                instructions: instructions,

                imageKey: imageKey,

                createdAt:
                    oldRecipe.createdAt || "",

                updatedAt:
                    new Date().toISOString()

            };

            await updateRecipe(
                oldRecipe.recipeId,
                updatedRecipe
            );

        } catch (error) {

            console.error(
                "Failed to update recipe:",
                error
            );

            alert(
                "Sorry, your recipe could not be updated."
            );

        }

        return;

    }


    const newRecipe = {

        title: name,

        category: category,

        ingredients: ingredients,

        instructions: instructions,

        imageKey: "",

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    try {

        const createdRecipe =
            await createRecipe(newRecipe);

        let finalRecipe =
            createdRecipe;

        if (imageFile) {
            console.log("IMAGE FILE FOUND", imageFile);
            const imageKey =
                await uploadImage(
                    createdRecipe.recipeId,
                    imageFile
                );
            console.log("IMAGE UPLOADED", imageKey);    

            finalRecipe =
                await updateRecipeData(
                    createdRecipe.recipeId,
                    {
                        ...createdRecipe,
                        imageKey: imageKey,
                        updatedAt:
                            new Date().toISOString()
                    }
                );

        }

        const recipeIndex =
            recipes.findIndex(
                recipe =>
                    recipe.recipeId ===
                    createdRecipe.recipeId
            );

        if (recipeIndex !== -1) {
            recipes[recipeIndex] =
                finalRecipe;
        }

        currentRecipeIndex =
            recipes.findIndex(
                recipe =>
                    recipe.recipeId ===
                    finalRecipe.recipeId
            );

        editingRecipeIndex = null;

        addDishScreen.style.display =
            "none";

        recipeForm.reset();

        saveRecipeButton.textContent =
            "Save to my cookbook ♡";

        displayCurrentRecipe();

    } catch (error) {

        console.error(
            "Failed to create recipe:",
            error
        );

        alert(
            "Sorry, your recipe could not be saved."
        );

    }

});


async function createRecipe(recipe) {

    const response =
        await fetch(
            `${API_URL}/recipes`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(recipe)

            }
        );

    if (!response.ok) {
        throw new Error(
            "Failed to create recipe"
        );
    }

    const createdRecipe =
        await response.json();

    recipes.push(createdRecipe);

    return createdRecipe;

}


async function updateRecipeData(
    recipeId,
    recipe
) {

    const response =
        await fetch(
            `${API_URL}/recipes/${recipeId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(recipe)

            }
        );

    if (!response.ok) {
        throw new Error(
            "Failed to update recipe"
        );
    }

    return await response.json();

}


async function updateRecipe(
    recipeId,
    recipe
) {

    try {

        const updatedRecipe =
            await updateRecipeData(
                recipeId,
                recipe
            );

        recipes[editingRecipeIndex] =
            updatedRecipe;

        currentRecipeIndex =
            editingRecipeIndex;

        editingRecipeIndex = null;

        addDishScreen.style.display =
            "none";

        recipeForm.reset();

        saveRecipeButton.textContent =
            "Save to my cookbook ♡";

        displayCurrentRecipe();

    } catch (error) {

        console.error(
            "Failed to update recipe:",
            error
        );

        alert(
            "Sorry, your recipe could not be updated."
        );

    }

}


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


async function deleteRecipe(index) {

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


    try {

        const response =
            await fetch(
                `${API_URL}/recipes/${recipe.recipeId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete recipe"
            );

        }


        recipes.splice(index, 1);


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


    } catch (error) {

        console.error(
            "Failed to delete recipe:",
            error
        );

        alert(
            "Sorry, the recipe could not be deleted."
        );

    }

}


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


    let imageHTML = "";


    if (recipe.imageUrl) {

        imageHTML = `

            <img
                class="recipe-image"
                src="${recipe.imageUrl}"
                alt="${recipe.title}"
            >

        `;

    }


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

        <div class="recipe-close-wrapper">

            <button
                class="recipe-close-book-btn"
                type="button"
            >
                Close Cookbook ♡
            </button>

        </div>

    `;


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


    recipePageNumber.textContent =
        `${currentRecipeIndex + 1} / ${recipes.length}`;


    previousRecipeButton.disabled =
        false;


    nextRecipeButton.disabled =
        currentRecipeIndex ===
        recipes.length - 1;


    recipeDisplay.scrollTop = 0;

}


previousRecipeButton.addEventListener(
    "click",
    function () {

        if (currentRecipeIndex === 0) {

            showContents();

            return;

        }


        if (currentRecipeIndex > 0) {

            currentRecipeIndex--;

            displayCurrentRecipe();

        }

    }
);


nextRecipeButton.addEventListener(
    "click",
    function () {

        if (currentRecipeIndex === -1) {

            if (recipes.length > 0) {

                currentRecipeIndex = 0;

                displayCurrentRecipe();

            }

            return;

        }


        if (
            currentRecipeIndex <
            recipes.length - 1
        ) {

            currentRecipeIndex++;

            displayCurrentRecipe();

        }

    }
);


const recipeSearch =
    document.querySelector("#recipe-search");

if (recipeSearch) {

    recipeSearch.addEventListener(
        "input",
        function () {

            const searchTerm =
                this.value
                    .toLowerCase()
                    .trim();

            const recipeItems =
                document.querySelectorAll(
                    ".recipe-index-item"
                );

            recipeItems.forEach(
                function (item) {

                    const recipeText =
                        item.textContent
                            .toLowerCase();

                    if (
                        recipeText.includes(
                            searchTerm
                        )
                    ) {

                        item.style.display =
                            "";

                    } else {

                        item.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./service-worker.js")
                .then(() => {

                    console.log(
                        "Service worker registered successfully."
                    );

                })
                .catch(error => {

                    console.error(
                        "Service worker registration failed:",
                        error
                    );

                });

        }
    );

}


loadRecipes();