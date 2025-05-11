document.addEventListener("DOMContentLoaded", function () {
    // Mobile Navigation Toggle
    const navToggle = document.createElement("button");
    navToggle.innerHTML = "&#9776;";
    navToggle.classList.add("text-white", "text-2xl", "lg:hidden");
    document.querySelector("header .container").prepend(navToggle);

    const nav = document.querySelector("nav");
    navToggle.addEventListener("click", function () {
        nav.classList.toggle("hidden");
    });

    // Form Submission Handling
    const form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        if (name === "" || email === "" || password === "") {
            alert("Please fill in all fields.");
        } else {
            alert("Registration Successful!");
            form.reset();
        }
    });
});