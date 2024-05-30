/*
    Podstawowe zasady: Projekt na Prograsmowanie    typ gry: strategia
    Co 10 dni przychodzi najeźdźca podbić wioskę. Zadaniem jest obrona wioski i jej rozwój
    daty najazdów dnia 10.20,30,40,50,.../ z dajszą tendencją co 10 dni i coraz większą siła
    Gracz musi wykarmić wioske i zadbać o jej bezpieczeństwo tworząc wojowników
    wraz z czasem przybędzie więcej wieśniaków do pracy
    Każdy wieśniak wymaga 10kcal/dzień. Budowa budynku zabiera 3 Mocy a crafting sórowca - 1.
    Hata zabiera 5, dom zabiera 10 miejsc mieszkalnych a kamienica 20
    Receptóry można zdobyć budując odpowiednie budynki na planszy.
    Moc pierwszego dnia to 10
    Każdego kolejnego dnia moc jest resetowana i ustawiana względem kości D20 gdzie minimalna moc do wylosowania to 5
*/

/*Wszystkie Dostępne receptury
    //Market
    5x  Iron     =>  5x Gold
    10x Wood     =>  3x Gold
    10x Rock     =>  3x Gold
    4x  Raw Iron =>  1x Gold
    5x  Wood     =>  4x Rock
    5x  Rock     =>  4x Wood
    //Huta
    2x  Raw Iron =>  1x Iron
    //Młyn
    3x  Przenica =>  60 kcal
    //Rzemieślnik
    1x  Moc      =>  5x Healt
    3x  Iron     =>  10 Obrona
    ==========
      Budowa
    ==========
    Hata         =>  5 Wood
    Dom          =>  7 Wood  3 Rock
    Kamienica    =>  4 Wood  20 Rock
    Market       =>  4 Wood  2 Rock
    Las          =>  3 Gold
    Tartak       =>  5 Gold  8 Wood  5 Kamień
    Kamieniołom  =>  3 Gold  5 Wood
    Kopalnia     =>  5 Gold  10 Wood  20 Kamień
*/

function getRandomInt(max) {return Math.floor(Math.random() * max)}

let buldingIsActive = false;
let bulding = null;
let alive = true;

// Statystyki
let playerPower = 10
let day = 1;
let peoples = 5;
let unemploys = 5;
let warriors = 5;
let healt = 100;
let caloricDemand = 0;
let defence = 0;

//Ukryte statystyki
let hauses = 0;

/* Działanie szczęćia wieśniaków
    96 - 100  =>   Zadowoleni      // Perk
    80 - 95   =>   Happy           // mały perk
    50 - 79   =>   Meh             //nic
    30 - 49   =>   Niezadowoleni   // mały debuff
    0  - 30   =>   Źli             // debuff
*/
let haipness = 50;
let caloricProduction = 0;

//Surowce
let caloric = 100;
let wood = 10;
let rock = 10;
let wheat = 0;
let rawIron = 0;
let iron = 0;
let gold = 10;

//Plansza
let Board = [['A1', null],['A2', null],['A3', null],['A4', null],
             ['B1', null],['B2', null],['B3', null],['B4', null],
             ['C1', null],['C2', null],['C3', null],['C4', null],
             ['D1', null],['D2', null],['D3', null],['D4', null]]


//Nowy Dzień
document.getElementById('nextButton').addEventListener('click', function(){
    newDay();
});

//Wykrywanie Klawiszologii
window.onkeydown = function (e) {
    //Anulowanie Budowy
    if (e.key === "Escape") {
        if(buldingIsActive){
            resetBuild()
        }
    }
}

//==================
//  Bulding System
//==================

//Wybór bloku do budowy
for(let i = 0; i < document.querySelectorAll('.bulding').length; i++){
    document.querySelectorAll('.bulding')[i].addEventListener('click', function(){
        if(!buldingIsActive){
        // console.log('Wybrano: ' + document.querySelectorAll('.bulding')[i].dataset.value)
        buldingIsActive = true;
        bulding = document.querySelectorAll('.bulding')[i].dataset.value;
        console.log(buldingIsActive + ' | ' + bulding)
        }
    });
}

//Budowa na odpowiednim polu
for(let i = 0; i < document.querySelectorAll('.boardSquare').length; i++){
    document.querySelectorAll('.boardSquare')[i].addEventListener('click', function(){
        if(buldingIsActive){

            for(let j = 0; j < Board.length; j++){
                if(Board[j][0] == document.querySelectorAll('.boardSquare')[i].dataset.code && Board[j][1] == null && unemploys > 0){
                    console.log('Build ' + bulding + ' on ' + document.querySelectorAll('.boardSquare')[i].dataset.code)
                    Board[j][1] = bulding;
                    unemploys--;
                    playerPower -= 3;
                    document.querySelectorAll('.boardSquare')[i].querySelector('img').src = 'image/buldings/' + bulding + '.png'

                    break;
                }
            }

            resetBuild();
        }
    });
}
//==================
//     Crafting
//==================



//==================
//     FUNKCJE
//==================

//funkcja resetowania budowy
function resetBuild(){
    buldingIsActive = false;
    bulding = null;
    console.log(buldingIsActive + ' | ' + bulding)
}

//funkcja nowego dnia
function newDay(){
    if(alive){
        day++;
        caloricDemand = 10*peoples;
        caloric -=caloricDemand
        playerPower = (getRandomInt(15)+5);
        generateResources();
        refleshResources();
    }

    if(healt <=0 || caloric < 0) alive = false;
    if(!alive) alert('You Lose');
}

//funkcja aktualizacji WSZYSTKICH statystyk
function refleshResources(){
    document.getElementById("day").innerHTML = "Dzień: " + day;
    document.getElementById("people").innerHTML = "Ludność: " + peoples;
    document.getElementById("unemploy").innerHTML = "Bezrobotni: " + unemploys;
    document.getElementById("warrior").innerHTML = "Obrońcy: " + warriors;
    document.getElementById("healt").innerHTML = "Zdrowie: " + healt;
    document.getElementById("caloric").innerHTML = "Zapotrzebowanie Kaloryczne: " + caloricDemand + " kcal/dzień";
    document.getElementById("power").innerHTML = "Moc: " + playerPower;
    document.getElementById("defence").innerHTML = "Siła Obrony: " + defence;

    document.getElementById("food").innerHTML = "Kalorie: " + caloric + " kcal"
    document.getElementById("wood").innerHTML = "Drewno: " + wood;
    document.getElementById("rock").innerHTML = "Kamień: " + rock;
    document.getElementById("wheat").innerHTML = "Przenica: " + wheat;
    document.getElementById("raw").innerHTML = "Ruda Żelaza: " + rawIron;
    document.getElementById("iron").innerHTML = "Żelazo: " + iron;
    document.getElementById("gold").innerHTML = "Złoto: " + gold;
}


//funkcja generująca zasoby z postawionych budynków
function generateResources(){
    for (let i = 0; i < Board.length; i++) {
        switch (Board[i][1]){
            case 'las':
                console.log('Tak to las')
                break;
        }
    }
}
