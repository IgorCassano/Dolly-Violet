/*
    Credenziali Admin
    - Username: Admin
    - Password: admin
*/

"use strict";

// Variabile di stato per determinare se si sta modificando o meno e tenere traccia della source di un immagine
let isModifying = false;
let isChaninging = false;
let profileImageSrc;

// Funzione che viene eseguita al caricamento della finestra
window.onload = () => {
    showHideLoader();
    checkLoginStatus();

    // Se l'utente non è loggato, mostra un messaggio di errore e redirige alla home
    if (localStorage.getItem("User") == null)
        showModal("Errore", "Devi essere loggato per accedere alle informazioni del tuo account", "index.html");
    else {
        populateAccountData(); // Popola i dati dell'account nella pagina
        purchaseHistoryFunction(); // Popola la cronologia degli acquisti dell'utente

        // Aggiunge un evento al pulsante di modifica
        const ModifyBtn = document.getElementById("modify-btn");
        ModifyBtn.addEventListener("click", () => {
            if (!isModifying) {
                Modify(); // Inizia la modifica delle informazioni
            } else {
                let formUser = document.getElementById("form-upload-user");
                formUser.addEventListener("submit", () => {
                    save(); // Salva le informazioni modificate
                })
            }
        });

        // Aggiunge un evento per mostrare o nascondere la password
        const showPasswordBtn = document.getElementById("show-password-btn");
        showPasswordBtn.addEventListener("click", () => {
            let utente = JSON.parse(localStorage.getItem("User"));
            let password = document.getElementById("password-text");

            if (showPasswordBtn.textContent == "Mostra password") {
                password.textContent = utente.password; // Mostra la password
                showPasswordBtn.textContent = "Nascondi password";
            } else {
                password.textContent = "*".repeat(utente.password.length); // Nasconde la password
                showPasswordBtn.textContent = "Mostra password";
            }
        });

        const changeImgBtn = document.getElementById("btnChangeImg");

        // In caso si sia fatto l'accesso con l'account admin non si può cambiare immagine profilo
        if(JSON.parse(localStorage.getItem("User")).username == "Admin")
            changeImgBtn.classList.add("d-none");
        
        changeImgBtn.addEventListener("click", () => {
            if (isChaninging == false)
                changeImg();
            else
                saveImg();
        })

        document.getElementById('number-input').addEventListener('input', function(event) {
            this.value = this.value.replace(/[^0-9]/g, ''); // Rimuove qualsiasi carattere che non sia un numero
        });
        document.getElementById('cardNumber-input').addEventListener('input', function(event) {
            this.value = this.value.replace(/[^0-9]/g, ''); // Rimuove qualsiasi carattere che non sia un numero
        });
        document.getElementById('cvv-input').addEventListener('input', function(event) {
            this.value = this.value.replace(/[^0-9]/g, ''); // Rimuove qualsiasi carattere che non sia un numero
        });
        
    }
}

// Salva l'immagine sul server
function saveImg() {
    isChaninging = false; 
    let utente = JSON.parse(localStorage.getItem("User"));
    document.getElementById("ImmaginiDisponibili").classList.add("d-none");

    if (document.getElementById("btnChangeImg").textContent != "Annulla") {
        // URL della richiesta con parametro username
        let finalUrl = urlChangeImageAccount + "?" + "username=" + utente.username;

        showHideLoader();
        // Esegui la fetch
        fetchWithTimeout(finalUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profileImageSrc }),
        })
        .then(response => response.json())
        .then(response => {
            if (response) {
                showModal("SUCCESSO", "Immagine aggiornata con successo !", "account.html");
                localStorageRefresh();
            } else if (response.error) {
                showModal("ERRORE", response.error.message);
            } else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        })
        .catch(err => {
            showModal("ERRORE", err.message);
        }).then(_ => {
            showHideLoader();
        });
    }

    // Cambia il testo del bottone
    document.getElementById("btnChangeImg").textContent = "Cambia immagine";
}

// Mostra immagini per cambiare l'icona del profilo
function changeImg() {
    isChaninging = true;

    document.getElementById("ImmaginiDisponibili").classList.remove("d-none");
    document.getElementById("btnChangeImg").textContent = "Annulla";

    const images = document.querySelectorAll(".selectable-img");

    images.forEach(img => {
        img.addEventListener("click", () => {
            // Rimuovi la classe 'selected-img' da tutte le immagini
            images.forEach(i => i.classList.remove("selected-img"));

            // Aggiungi la classe 'selected-img' all'immagine cliccata
            img.classList.add("selected-img");

            // Memorizza il percorso dell'immagine selezionata
            profileImageSrc  = img.src;
            document.getElementById("btnChangeImg").textContent = "Salva Immagine";

            //console.log("Immagine selezionata:", profileImageSrc );
        });
    });
}

// Funzione che popola i dati dell'account nella pagina
function populateAccountData() {
    let utente = JSON.parse(localStorage.getItem("User"));
    //console.log(utente);

    // Popola i campi con i dati dell'utente
    let username = document.getElementById("username");
    username.textContent = utente.username;

    let avatarImage = document.getElementById("avatarImage");
    avatarImage.src = utente.profileImageSrc;

    let nome = document.getElementById("name-text");
    nome.textContent = utente.name ?? "Campo vuoto"; // Controlla se il campo è vuoto

    let cognome = document.getElementById("surname-text");
    cognome.textContent = utente.surname ?? "Campo vuoto"; // Controlla se il campo è vuoto

    let numero = document.getElementById("number-text");
    numero.textContent = utente.phoneNumber ?? "Campo vuoto"; // Controlla se il campo è vuoto

    let email = document.getElementById("email-text");
    email.textContent = utente.email;

    let password = document.getElementById("password-text");
    password.textContent = "*".repeat(utente.password.length); // Mostra la password nascosta

    let state = document.getElementById("country-text");
    state.textContent = utente.country;

    let city = document.getElementById("city-text");
    city.textContent = utente.city;

    let address = document.getElementById("address-text");
    address.textContent = utente.address;

    let cardName = document.getElementById("cardName-text");
    cardName.textContent = utente.cardName ?? "Campo vuoto"; // Controlla se il campo è vuoto

    let cardNumber = document.getElementById("cardNumber-text");
    cardNumber.textContent = utente.cardNumber ?? "Campo vuoto"; // Controlla se il campo è vuoto

    let cardDate = document.getElementById("cardDate-text");
    cardDate.textContent = utente.expirationDate ?? "Campo vuoto"; // Controlla se il campo è vuoto

    let CVV = document.getElementById("cvv-text");
    CVV.textContent = utente.cvv ?? "Campo vuoto"; // Controlla se il campo è vuoto
}

// Funzione che abilita la modifica dei dati dell'account
function Modify() {
    event.preventDefault();
    let utente = JSON.parse(localStorage.getItem("User"));
    const showPasswordBtn = document.getElementById("show-password-btn");
    showPasswordBtn.classList.add("d-none");
    const ModifyBtn = document.getElementById("modify-btn");
    ModifyBtn.textContent = "Salva Informazioni"; // Cambia il testo del pulsante
    isModifying = true; // Imposta lo stato come 'modificando'

    const text = document.querySelectorAll(".section-content");
    const input = document.querySelectorAll(".input-content");
    const fieldNames = [
        "name", "surname", "phoneNumber", "email", "password",
        "country", "city", "address", "cardName", "cardNumber",
        "expirationDate", "cvv"
    ];

    text.forEach(textBox => textBox.classList.add("d-none")); // Nasconde i dati visualizzati

    fieldNames.forEach((fieldName, index) => {
        if (utente[fieldName] !== null) {
            input[index].value = utente[fieldName]; // Pre-compila i campi con i dati attuali
        }
    });

    if(utente.acceptedTerms)
        document.getElementById("accept-terms").checked = true;
    else
    document.getElementById("accept-terms").checked = false;

    input.forEach(inputBox => inputBox.classList.remove("d-none")); // Mostra i campi di input
}

// Funzione per salvare le modifiche apportate all'account
function save() {
    event.preventDefault();
    event.stopImmediatePropagation();
    const showPasswordBtn = document.getElementById("show-password-btn");
    let utente = JSON.parse(localStorage.getItem("User"));
    showPasswordBtn.classList.remove("d-none");
    const fieldNames = [
        "name", "surname", "phoneNumber", "email", "password",
        "country", "city", "address", "cardName", "cardNumber",
        "expirationDate", "cvv"
    ];

    let updatedUser = utente;

    fieldNames.forEach((fieldName, index) => {
        const input = document.querySelectorAll(".input-content")[index];
        if (input && input.value) {
            // Gestione del campo "country" per il selettore
            if (fieldName === "country") {
                const selectElement = document.getElementById("country-input");
                updatedUser[fieldName] = selectElement.value;
            } else {
                updatedUser[fieldName] = input.value;
            }
        }
    });

    updatedUser.shoppingCart = utente.shoppingCart; // Mantieni il carrello
    updatedUser.purchaseHistory = utente.purchaseHistory; // Mantieni la cronologia acquisti
    updatedUser.acceptedTerms = true;
    let finalUrl = urlUploadAccount + "?" + "username=" + utente.username;

    showHideLoader(); // Mostra il loader mentre si invia la richiesta
    fetchWithTimeout(finalUrl, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
    })
        .then(response => response.json())
        .then(response => {
            if (response) {
                localStorageRefresh(); // Ricarica i dati dell'utente
                showModal("SUCCESSO", "Informazioni aggiornate con successo", "account.html"); // Mostra il messaggio di successo
            }
            else if (response.error) {
                showModal("ERRORE", response.error.message); // Mostra il messaggio di errore
            }
            else {
                showModal("ERRORE", "Errore sconosciuto dal server");
            }
        }).catch(err => {
            showModal("ERRORE", err.message);
        }).then(_ => {
            showHideLoader(); // Nascondi il loader
        });
}

// Funzione che popola la cronologia degli acquisti dell'utente
function purchaseHistoryFunction() {
    let utente = JSON.parse(localStorage.getItem("User"));
    const purchaseHistoryDiv = document.getElementById("HistoryProductsWrapper");

    if (utente.purchaseHistory.length > 0) {
        // Se l'utente ha acquistato prodotti, li mostra
        utente.purchaseHistory.reverse().forEach(purchase => {
            let purchaseItemDiv = document.createElement("div");
            purchaseItemDiv.classList.add("item", "m-3", "col-lg-3", "col-6");

            let card = document.createElement("div");
            card.classList.add("card");

            let img = document.createElement("img");
            img.classList.add("card-img-top");
            img.src = purchase.picture[0];
            img.addEventListener("mouseenter", () => {
                img.src = purchase.picture[1]; // Mostra l'immagine alternativa al passaggio del mouse
            })
            img.addEventListener("mouseout", () => {
                img.src = purchase.picture[0]; // Torna all'immagine originale
            })
            card.appendChild(img);

            let divBody = document.createElement("card-body");
            divBody.classList.add("mt-3");

            let productName = document.createElement("h6");
            productName.textContent = purchase.name;
            divBody.appendChild(productName);

            let taglia = document.createElement("p");
            taglia.textContent = "Taglia: " + purchase.size;
            divBody.appendChild(taglia);

            let buttonShopPage = document.createElement("button");
            buttonShopPage.addEventListener("click", () => {
                redirectTo("prodotto.html", purchase.id); // Link per acquistare di nuovo
            })
            buttonShopPage.textContent = "Acquista di nuovo";
            buttonShopPage.classList.add("btn", "btnLink");
            divBody.appendChild(buttonShopPage);

            card.appendChild(divBody);
            purchaseItemDiv.appendChild(card);
            purchaseHistoryDiv.appendChild(purchaseItemDiv);
        });
    }
    else {
        // Se non ci sono acquisti, mostra un messaggio
        let emptyPurchaseHistoryDiv = document.createElement("div");
        emptyPurchaseHistoryDiv.classList.add("emptyPurchaseHistory");

        let emptyPurchaseHistory = document.createElement("h3");
        emptyPurchaseHistory.textContent = "Non hai ancora fatto acquisti, SBRIGATI!!";
        emptyPurchaseHistoryDiv.appendChild(emptyPurchaseHistory);

        let buttonAcquista = document.createElement("button");
        buttonAcquista.classList.add("btn", "btn-user", "mt-3");
        buttonAcquista.textContent = "Vai al catalogo";
        buttonAcquista.addEventListener("click", () => {
            redirectTo("catalogo.html"); // Link per andare al catalogo
        })
        emptyPurchaseHistoryDiv.appendChild(buttonAcquista);
        purchaseHistoryDiv.appendChild(emptyPurchaseHistoryDiv);
    }
}