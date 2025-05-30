"use strict";

// Index Script

window.onload = () => {
    showHideLoader();
    checkLoginStatus();
    getData();
}

// Funzione per recuperare i dati dal server
function getData() {
    showHideLoader(); // Mostra il loader durante il recupero dei dati
    fetchWithTimeout(urlGetData, { method: "GET" })
        .then(response => response.json()) 
        .then(response => { 
            if (response) {
                populateHome(response); // Popola la home con i dati ricevuti
            } else if (response.error) { 
                showModal("ERRORE", response.error.message); // Mostra un messaggio di errore personalizzato
            } else { 
                showModal("ERRORE", "Errore sconosciuto dal server"); // Mostra un messaggio di errore generico
            }
        }).catch(err => {
            showModal("ERRORE", err.message); // Mostra il messaggio di errore
        }).then(_ => {
            showHideLoader(); // Nasconde il loader una volta completato il processo
        });
}

// Funzione per popolare la home con i dati ricevuti
function populateHome(dati) {
    intervalAnimation();
    //console.log(dati);

    let negozio = dati.Shop; // Estrae i dati del negozio dall'oggetto ricevuto

    // Seleziona i contenitori HTML in cui inserire i prodotti
    let divFelpa = document.getElementById("hoodieWrapper");
    let divGiacca = document.getElementById("jacketWrapper");
    let divPantaloe = document.getElementById("trousersWrapper");
    let divCatalogo = document.getElementById("catalogoWrapper");

    // Itera su ciascun elemento ricevuto dal server
    for (let element of negozio) {
        let prodotto; // Variabile per il prodotto HTML generato

        // Determina il tipo di prodotto e lo aggiunge al contenitore appropriato
        switch (element.type) {
            case "felpa":
                prodotto = addProduct(element); // Crea un elemento prodotto
                prodotto.classList.add("item"); // Aggiunge una classe al prodotto
                //console.log(prodotto);
                divFelpa.appendChild(prodotto); // Aggiunge il prodotto al contenitore delle felpe
                break;

            case "pantalone":
                prodotto = addProduct(element); 
                prodotto.classList.add("item"); 
                divPantaloe.appendChild(prodotto); 
                break;

            case "giacca":
                prodotto = addProduct(element); 
                prodotto.classList.add("item"); 
                //console.log(prodotto); 
                divGiacca.appendChild(prodotto); 
                break;

            default: // Per tutti gli altri tipi di prodotto vado ad aggingerli alla sezione catalogo
                prodotto = addProduct(element); 
                prodotto.classList.add("item"); 
                //console.log(prodotto); 
                divCatalogo.appendChild(prodotto); 
                break;
        }
    }
}