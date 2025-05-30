"use strict";

let params;

/* Evento che viene eseguito quando la pagina è completamente caricata */
window.onload = () => {
    showHideLoader();
    checkLoginStatus();
    intervalAnimation();
    const container = document.getElementById("container");

    // Se la query string contiene 'q=Register', mostra il form di registrazione
    if (new URLSearchParams(window.location.search).get('q') == "Register") {
        container.classList.add("right-panel-active");
        document.title = "DOLLY VIOLET - BENVENUTO !";
    } else {
        document.title = "DOLLY VIOLET - BENTORNATO !";
        container.classList.remove("right-panel-active");
    }

    intervalAnimation();
    
    const registerButton = document.getElementById("register");
    const loginButton = document.getElementById("login");
    const registerForm = document.getElementById("register-form");
    let loginForm = document.getElementById("login-form");

    // Aggiunge un listener al form di login per verificare l'accesso quando il form viene inviato
    loginForm.addEventListener("submit", () => {
        VerificaAccesso();
    });

    // Aggiunge un listener al form di registrazione per aggiungere un nuovo utente
    registerForm.addEventListener("submit", () => {
        AggiungiUtente();
    });

    // Aggiunge un listener al bottone di registrazione per mostrare il pannello di registrazione
    registerButton.addEventListener("click", () => {
        container.classList.add("right-panel-active");
        document.title = "DOLLY VIOLET - BENVENUTO !";
    });

    // Aggiunge un listener al bottone di login per mostrare il pannello di login
    loginButton.addEventListener("click", () => {
        container.classList.remove("right-panel-active");
        document.title = "DOLLY VIOLET - BENTORNATO !";
    });
}

/* Funzione per verificare l'accesso dell'utente */
function VerificaAccesso() {
    event.preventDefault();
    event.stopImmediatePropagation();

    showHideLoader();

    fetchWithTimeout(urlGetData, { method: "GET" }) // Chiamata fetch con timeout
        .then(response => response.json())
        .then(response => {
            if (response)
                VerificaDatiForm(response);
            else if (response.error) {
                showModal("ERRORE", response.error.message);
            }
            else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        }).catch(err => {
            showModal("ERRORE", err.message);
        }).then(_ => {
            showHideLoader();
        });
}

/* Funzione per verificare se i dati inseriti nel form sono validi */
function VerificaDatiForm(dati) {
    //console.log(dati);
    const user = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    let esiste = false;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Scorre tutti gli utenti per verificare se esiste un match per username e password
    for (let element of dati.Users) {
        //console.log(element.username, element.password);
        if (element.username == username)
            if (element.password == password) {
                esiste = true;
                localStorage.setItem("User", JSON.stringify(element));
            }
    }

    // Se l'utente è stato trovato va alla home
    if (esiste) {
        user.value = "";
        passwordInput.value = "";
        window.location.href = "index.html";
    }
    else {
        showModal("ERRORE", "USERNAME O PASSWORD NON VALIDI");
    }
}

/* Funzione per aggiungere un nuovo utente */
function AggiungiUtente() {
    event.preventDefault();
    event.stopImmediatePropagation();

    // Recupera i valori dai campi del form
    let username = document.getElementById("UsernameInput").value;
    let password = document.getElementById("passwordInput").value;
    let email = document.getElementById("EmailInput").value;
    let country = document.querySelector(".select-box select").value;
    let address = document.getElementById("addressInput").value;
    let city = document.getElementById("CityInput").value;

    //console.log(username + " " + password + " " + email + " " + country + " " + address + " " + city);

    params = {
        "username": username,
        "acceptedTerms": false,
        "email": email,
        "name":null,
        "surname":null,
        "password": password,
        "country": country,
        "city": city,
        "address": address,
        "phoneNumber":null,
        "cardNumber":null,
        "cvv":null,
        "cardName":null,
        "expirationDate":null,
        "profileImageSrc":"https://i.ibb.co/JqMTb3d/avatar.png",
        "shoppingCart": [
        ],
        "purchaseHistory":[

        ]
    };

    controlloUsername(urlGetData);
}

/* Funzione per controllare se l'username è già utilizzato */
function controlloUsername(url) {
    showHideLoader();

    fetchWithTimeout(url, { method: "GET" })
        .then(response => response.json())
        .then(response => {
            if (response)
                verificaUserGiaEsistente(response);
            else if (response.error) {
                showModal("ERRORE", response.error.message);
            }
            else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        }).catch(err => {
            showModal("ERRORE", err.message);
        }).then(_ => {
            showHideLoader();
        });
}

/* Funzione per verificare se l'utente è già registrato */
function verificaUserGiaEsistente(dati) {
    let username = document.getElementById("UsernameInput").value;
    let usernameUguali = false;

    // Scorre tutti gli utenti per verificare se l'username è già utilizzato
    for (let element of dati.Users) {
        if (element.username == username) {
            usernameUguali = true;
            break;
        }
    }

    // Se l'username non è già preso, invia i dati per registrare l'utente
    if (!usernameUguali)
        inviaDati("POST", urlAddUser, params);
    else {
        showModal("ATTENZIONE !", "L'username inserito è già esistente, inserisci un'altro username");
    }
}

/* Funzione per inviare i dati al server per registrare un nuovo utente */
function inviaDati(method, url, params) {
    const user = document.getElementById("UsernameInput");
    const email = document.getElementById("EmailInput");
    const password = document.getElementById("passwordInput");
    const country = document.querySelector(".select-box select");
    const city = document.getElementById("CityInput");
    const address = document.getElementById("addressInput");

    showHideLoader();

    fetchWithTimeout(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(params),
    })
        .then(response => response.json())
        .then(response => {
            if (response) {
                showModal("SUCCESSO", "La registrazione è avvenuta con successo, ora puoi accedere con i dati appena forniti!","register-login.html?q=Login");
                // Svuota i campi del form
                user.value = "";
                email.value = "";
                password.value = "";
                country.value = "";
                city.value = "";
                address.value = "";
            }
            else if (response.error) {
                showModal("ERRORE", response.error.message);
            }
            else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        }).catch(err => {
            showModal("ERRORE", err.message);
        }).then(_ => {
            showHideLoader();
        });
}