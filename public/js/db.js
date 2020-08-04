db.enablePersistence().catch(function (err) {
  if (err.code == "failed-precondition") {
    // Multiple tabs open
  } else if (err.code == "unimplemented") {
    // The current browser does not support all of the features
  }
});

db.collection("recipes").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    console.log(change.doc.data(), change.doc.id);
    if (change.type === "added") {
      renderRecipe(change.doc.data(), change.doc.id);
    }
    if (change.type === "removed") {
      removeRecipe(change.doc.id);
    }
  });
});

// Add new recipe
const addForm = document.querySelector("#side-form");
addForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const newRecipe = {
    title: document.querySelector("#title").value,
    ingredients: document.querySelector("#ingredients").value,
  };

  db.collection("recipes")
    .add(newRecipe)
    .catch((err) => console.log(err));

  document.querySelector("#title").value = "";
  document.querySelector("#ingredients").value = "";
});

// Delete recipes
const recipeContainer = document.querySelector(".recipes");
recipeContainer.addEventListener("click", (evt) => {
  if (evt.target.tagName === "I") {
    const id = evt.target.getAttribute("data-id");
    db.collection("recipes").doc(id).delete();
  }
});
