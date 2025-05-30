"use strict";

/* SCRIPT GLOBALE */

// URL per le API
let urlGetData = "https://server-epf2.onrender.com/data"; // Recupero dati generali
let urlAddUser = "https://server-epf2.onrender.com/add-user"; // Aggiungi un utente
let urlAddCart = "https://server-epf2.onrender.com/add-cart"; // Aggiungi prodotto al carrello
let urlRemoveCart = "https://server-epf2.onrender.com/remove-cart"; // Rimuovi prodotto dal carrello
let urlRemoveAllProducts = "https://server-epf2.onrender.com/clear-cart"; // Rimuovi tutti i prodotti dal carrello
let urlAddHistory = "https://server-epf2.onrender.com/add-purchase"; // Aggiungi storico acquisti
let urlUploadAccount = "https://server-epf2.onrender.com/update-user"; // Aggiorna informazioni utente
let urlChangeImageAccount = "https://server-epf2.onrender.com/update-profile-image"; // Aggiorna l'immagine profilo

// Funzione per animare gli elementi con un intervallo
function intervalAnimation(){
    ScrollReveal().reveal('.intervalAnimation', {
        interval: 80,    // Intervallo tra le animazioni degli elementi
        duration: 900,   // Durata dell'animazione (in millisecondi)
        origin: 'bottom', // Origine dell'animazione (dal basso)
        distance: '50px', // Distanza di movimento
        scale: 0.5,      // Scala iniziale (50% della dimensione normale)
        opacity: 0,      // Opacità iniziale (trasparente)
        reset: false,    // Non resetta l'animazione dopo che è stata eseguita
    });
}

// Funzione per animare i prodotti quando entrano nella vista
function animatedProduct(){
    ScrollReveal().reveal('.prodotto', {
        duration: 1500,  
        origin: 'bottom', 
        distance: '50px', 
        scale: 0.5,        
        opacity: 0,       
        reset: false, 
    });
}

/* Funzione per verificare se l'utente è loggato o meno */
function checkLoginStatus() {

    let divLogged = document.getElementById("Logged");
    let divNotLogged = document.getElementById("login-register");

    // Se l'utente non è loggato (nessun "User" nel localStorage)
    if (localStorage.getItem("User") == null) {
        divLogged.classList.add("d-none"); 
        divNotLogged.classList.remove("d-none"); 
    } else {
        divLogged.classList.remove("d-none"); // Mostra il div che mostra l'utente loggato
        const user = JSON.parse(localStorage.getItem("User"));
        document.getElementById("navbarAvatar").src = user.profileImageSrc;
        divNotLogged.classList.add("d-none"); // Nascondi il div per il login/registrazione
    }
}

/* Funzione per mostrare un loader e nasconderlo */
function showHideLoader(){
    const loader = document.querySelector(".loader");
    if(loader.classList.contains("loader-hidden")){
        loader.classList.remove("loader-hidden");
    }
    else
        loader.classList.add("loader-hidden");
}


/* Funzione per effettuare il lzogout dell'utente */
function LogOut() {
    localStorage.clear(); // Rimuovi tutti i dati dal localStorage
    showModal("SUCCESSO", "Uscita avvenuta con successo, verrai indirizzato alla homepage", "index.html");
}

/* Funzione per mostrare un modal con un titolo, un messaggio, un link e pulsanti opzionali */
function showModal(title, message, closeLink, buttons = []) {
    var Modal = new bootstrap.Modal(document.getElementById('Modal')); // Crea il modal con Bootstrap

    // Imposta il titolo e il corpo del modal
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").textContent = message;

    const divButtons = document.getElementById("divButtons");
    divButtons.innerHTML = ""; // Pulisci i pulsanti precedenti

    // Pulsante di chiusura del modal
    let button = document.createElement("button");
    if(closeLink != null && closeLink != ""){
        button.id = "returnHome";
        button.classList.add("btn", "btn-outline-light");
        button.addEventListener("click", () => {
            window.location.href = closeLink;
        })
    }
    else{
        button.id = "closeModal";
        button.type = "button";
        button.classList.add("btn", "btn-outline-light");
        button.dataset.dismiss = "modal"; // Collega il pulsante alla funzionalità di chiusura di Bootstrap
    }
    button.textContent = "Chiudi";
    divButtons.appendChild(button);

    // Aggiungi pulsanti opzionali se forniti
    buttons.forEach(button => {
        divButtons.appendChild(button);
    });

    Modal.show(); // Mostra il modal
}

/* Funzione per gestire il timeout delle richieste fetch */
function fetchWithTimeout(url, options, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Richiesta scaduta. Tempo di attesa superato.")); // Timeout della richiesta
        }, timeout);

        // Effettua la richiesta fetch
        fetch(url, options)
            .then(response => {
                clearTimeout(timeoutId); // Cancella il timeout se la richiesta è stata completata
                resolve(response);
            })
            .catch(err => {
                clearTimeout(timeoutId); // Cancella il timeout se c'è un errore
                reject(err);
            });
    });
}

/* Funzione per reindirizzare l'utente a una nuova pagina, verificando se è loggato */
function redirectTo(url, id, type) {
    // Inizializza i parametri dell'URL
    let UrlParams = new URLSearchParams();

    // Se è presente un id prodotto oppure se la pagina di destinazione è il carrello
    if (id || url == "carrello.html") {
        // Controllo se l'utente ha fatto l'accesso
        if (localStorage.getItem("User") == null) {
            // L'utente non è loggato, mostra un messaggio e un pulsante per il login
            let btnRedirectToLogin = document.createElement("button");
            btnRedirectToLogin.classList.add("btn", "btn-warning");
            btnRedirectToLogin.textContent = "Vai al login";
            btnRedirectToLogin.addEventListener("click", () => {
                window.location.href = "register-login.html?q=Login";
            });
            if(url == "carrello.html")
                showModal("Errore", "Devi essere loggato se vuoi visualizzare i tuoi prodotti nel carrello", "", [btnRedirectToLogin]);
            else
                showModal("Errore", "Devi essere loggato se vuoi acuistare un prodotto", "", [btnRedirectToLogin]);
            return;
        } else {
            // L'utente è loggato, aggiungi l'id ai parametri
            UrlParams.append("id", id);
        }
    }

    // Se è presente un type, aggiungilo ai parametri
    if (type) {
        UrlParams.append("type", type);
    }

    // Costruisci l'URL finale
    let finalUrl = url;
    if ([...UrlParams].length > 0) { //Controllo se ci sono parametri all'interno di url params
        finalUrl += "?" + UrlParams.toString();
    }

    // Reindirizza alla pagina finale
    window.location.href = finalUrl;
}


/* Funzione per mostrare la barra di ricerca */
function showSearchBar() {
    const search = document.getElementById('search');
    search.classList.add('show-search'); // Aggiungi la classe per mostrare la barra di ricerca
    let SearchInput = document.getElementById("search__input");
    SearchInput.value = "";
    SearchInput.focus();
}

/* Funzione per nascondere la barra di ricerca */
function hideSearchBar() {
    const search = document.getElementById('search');
    search.classList.remove('show-search'); // Rimuovi la classe per nascondere la barra di ricerca
}

/* Funzione per eseguire la ricerca */
function search() {
    event.stopImmediatePropagation(); // Impedisce che l'evento si propagi
    event.preventDefault(); // Impedisce l'azione predefinita del form

    let SearchInput = document.getElementById("search__input");
    let searchParams = SearchInput.value; // Ottieni il valore della ricerca

    let urlParams = new URLSearchParams({ "type": searchParams }); // Crea i parametri della query
    window.location.href = "catalogo.html?" + urlParams; // Reindirizza alla pagina del catalogo con i parametri di ricerca
}

/* Funzione per aggiornare i dati dell'utente nel localStorage */
function localStorageRefresh(){
    const correntUser = JSON.parse(localStorage.getItem("User"));

    fetchWithTimeout(urlGetData, { method: "GET" }) // Chiamata fetch con timeout
        .then(response => response.json())
        .then(response => {
            if (response){
                for(let utente of response.Users){
                    //console.log(utente);
                    if(utente.username == correntUser.username){
                        localStorage.clear();
                        localStorage.setItem("User", JSON.stringify(utente));
                    }
                }
            }
            else if (response.error) {
                showModal("ERRORE", response.error.message);
            }
            else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        }).catch(err => {
            showModal("ERRORE", err.message);
        })
}

/* Funzione per aggiungere un prodotto alla pagina */
function addProduct(prodotto) {

    // Crea il contenitore per il prodotto
    const colonnaProdotto = document.createElement("div");
    colonnaProdotto.classList.add("col-6", "col-lg-3", "col-md-6", "prodotto","text-center");

    // Crea la card del prodotto
    const cardProdotto = document.createElement("div");
    cardProdotto.classList.add("card", "mt-2");

    // Aggiunge l'immagine del prodotto
    const immagineProdotto = document.createElement("img");
    immagineProdotto.classList.add("card-img-top");
    immagineProdotto.src = prodotto.picture[0];
    cardProdotto.appendChild(immagineProdotto);

    // Crea il layer per le taglie
    const overlayTaglie = document.createElement("div");
    overlayTaglie.classList.add("hover-overlay");

    const titoloTaglie = document.createElement("h5");
    titoloTaglie.textContent = "SIZE";
    titoloTaglie.classList.add("sizeTitle", "fs-4", "fs-md-3", "fs-lg-2"); // Uso delle classi fs di Bootstrap per la responsività
    overlayTaglie.appendChild(titoloTaglie);

    const taglieDisponibili = ["Small", "Medium", "Large", "Xlarge", "XXlarge"];
    for (let i = 0; i < taglieDisponibili.length; i++) {
        const pulsanteTaglia = document.createElement("button");
        pulsanteTaglia.classList.add("btn-taglia", "sizeButton", "fs-6", "fs-md-5", "fs-lg-4"); // Uso delle classi fs di Bootstrap per la responsività
        pulsanteTaglia.textContent = taglieDisponibili[i];
        if (!prodotto.size[i])
            pulsanteTaglia.disabled = true;
        overlayTaglie.appendChild(pulsanteTaglia);
    }

    cardProdotto.appendChild(overlayTaglie);

    // Aggiunge il corpo della card
    const corpoCard = document.createElement("div");
    corpoCard.classList.add("card-body");

    const productTitle = document.createElement("h1");
    productTitle.id = "productTitle";
    productTitle.textContent = prodotto.name;
    productTitle.classList.add("fs-4", "fs-md-3", "fs-lg-2"); // Uso delle classi fs di Bootstrap per la responsività
    corpoCard.appendChild(productTitle);

    const prezzoProdotto = document.createElement("p");
    prezzoProdotto.classList.add("price");
    // Controllo sul prezzo di sconto
    if (prodotto.salePrice == 0) {
        // Mostra solo il prezzo normale
        prezzoProdotto.textContent = prodotto.price.toLocaleString('it-IT', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + "€";
    } else {
        // Mostra il prezzo barrato e il prezzo scontato
        prezzoProdotto.innerHTML =
            "<s>" + prodotto.price.toLocaleString('it-IT', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + "€</s>    " +
            prodotto.salePrice.toLocaleString('it-IT', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + "€";

        // Aggiungi la classe al contenitore overlayTaglie
        overlayTaglie.classList.add("paddingMancante");
    }

    // Aggiungi la classe e l'elemento al DOM
    prezzoProdotto.classList.add("card-text");
    corpoCard.appendChild(prezzoProdotto);

    cardProdotto.appendChild(corpoCard);
    colonnaProdotto.appendChild(cardProdotto);

    colonnaProdotto.addEventListener("mouseover", () => {
        immagineProdotto.src = prodotto.picture[1];
    });
    colonnaProdotto.addEventListener("mouseout", () => {
        immagineProdotto.src = prodotto.picture[0];
    });
    colonnaProdotto.addEventListener("click", () => {
        redirectTo("prodotto.html", prodotto.id);
    });

    return colonnaProdotto;
}