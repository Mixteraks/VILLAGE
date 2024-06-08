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
    Co 5 dni od dnia 1 dyskuje się 1 złoto w celu rozwoju wsi.
*/

/*Wszystkie Dostępne receptury
    //Market
    5x  Iron     =>  5x Gold
    10x Wood     =>  3x Gold
    10x Rock     =>  3x Gold
    4x  Raw Iron =>  1x Gold
    10x Wheat    =>  2x Gold
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

let freeBuild = false;
let immunitly = false;

let buldingIsActive = false;
let bulding = null;
let alive = true;
let usedGenerateMoreResources = false;

let maMarket = false;
let maHuta = false;
let maMlyn = false;
let maRzemieslnik = false;

// Statystyki
let playerPower = 10
let day = 1;
let peoples = 5;
let unhaused = 5;
let unemploys = 5;
let warriors = 0;
let healt = 100;
let caloricDemand = (peoples * 10) + (warriors * 40);
let defence = 0;

//Ukryte statystyki
let hauses = 0;
let tip = document.getElementById('tips')

/* Działanie szczęćia wieśniaków
    96 - 100  =>   Zadowoleni      // Perk
    80 - 95   =>   Happy           // mały perk
    50 - 79   =>   Meh             //nic
    30 - 49   =>   Niezadowoleni   // mały debuff
    0  - 30   =>   Źli             // debuff
*/
let haipness = 50;
let nextRaidPower = 0;
let rainPower = 0;

//Surowce
let caloric = 150;
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
document.getElementById('nextButton').addEventListener('mouseover', function(){
    if(!buldingIsActive){
        tip.innerHTML = "Kończy aktualną turę i przechodzi do kolejnego dnia,<br> dając ci surowce z twoich budowli"
    }
})
document.getElementById('nextButton').addEventListener('click', function(){
    newDay();
});

//Większy czas pracy
document.getElementById('generate').addEventListener('click', function(){
    if(!usedGenerateMoreResources && gold >= 10){
        playerPower -= 2;
        gold -= 10;
        generateResources();
        refleshResources();
        usedGenerateMoreResources = true;
        document.getElementById('generate').classList.add('used')
    }
});

document.getElementById('generate').addEventListener('mouseover', function(){
    if(!buldingIsActive){
        tip.innerHTML = "Zwiększa dobę pracy przez co dostajesz natychmiastowo<br> dodatkowe surowce z postawionych budynków"
    }
})

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
        if(!buldingIsActive && document.querySelectorAll('.bulding')[i].dataset.value != 'clear'){
        // console.log('Wybrano: ' + document.querySelectorAll('.bulding')[i].dataset.value)
        buldingIsActive = true;
        bulding = document.querySelectorAll('.bulding')[i].dataset.value;
            tip.innerHTML = 'Możesz anulować budowę klikając <b>Esc</b> na klawiaturze! <br> Aktualnie budujesz ' + bulding;
        // console.log(buldingIsActive + ' | ' + bulding)
        }else if(!buldingIsActive && document.querySelectorAll('.bulding')[i].dataset.value == 'clear'){
            tip.innerHTML = 'Możesz anulować budowę klikając <b>Esc</b> na klawiaturze! <br> Aktualnie jesteś w trybie rozbiórki';
            buldingIsActive = true;
            build = null;
        }
    });
}

let recip;
for(let i = 0; i < document.querySelectorAll('.boardSquare').length; i++){
//Informacje o danym polu
document.querySelectorAll('.boardSquare')[i].addEventListener('mouseover', function(){
    if(!buldingIsActive){
        tip.innerHTML = "Pole: " + Board[i][0] + "<br>Budynek: " + Board[i][1]
    }
})
//Budowa na odpowiednim polu
    document.querySelectorAll('.boardSquare')[i].addEventListener('click', function(){
        if(buldingIsActive){
            budowa: for(let j = 0; j < Board.length; j++){
                if(Board[j][0] == document.querySelectorAll('.boardSquare')[i].dataset.code && Board[j][1] == null && unemploys > 0 && bulding != null){
                    
                    if(!freeBuild  && playerPower >= 3 ){
                        switch (bulding){
                            case 'las':
                                if(gold >= 3){
                                    gold -=3;
                                } else break budowa;
                                break;
                            case 'kopalniaI':
                                if(gold >= 3 && wood >= 3){
                                    gold -=3;
                                    wood -= 3;
                                } else break budowa;
                                break;
                            case 'hata':
                                if(wood >= 5){
                                    wood -= 5;
                                } else break budowa;
                                break;
                            case 'dom':
                                if(wood >= 7 && rock >= 3){
                                    wood -= 7;
                                    rock -= 3;
                                } else break budowa;
                                break;
                            case 'kamienica':
                                if(wood >= 4 && rock >= 20 && iron >= 2){
                                    wood -= 4;
                                    rock -= 20;
                                    iron -= 2;
                                } else break budowa;
                                break;
                            case 'market':
                                if(wood >= 4 && rock >= 3){
                                    wood -= 4;
                                    rock -= 3;
                                } else break budowa;
                                break;
                            case 'pole':
                                if(gold >= 2 && rock >= 3 && wood >= 10){
                                    wood -= 10;
                                    rock -= 3;
                                    gold -= 2;
                                } else break budowa;
                                break;
                            case 'mlyn':
                                if(wood >= 12 && rock >= 5){
                                    wood -= 12;
                                    rock -= 5
                                } else break budowa;
                                break;
                            case 'farma':
                                if(gold >= 2 && rock >= 3 && wood >= 10){
                                    gold -=3;
                                    rock -= 3;
                                    wood -= 10;
                                } else break budowa;
                                break;
                            case 'huta':
                                if(wood >= 5 && rock >= 20 && rawIron >= 3){
                                    wood -= 5;
                                    rock -= 20;
                                    rawIron -= 3;
                                } else break budowa;
                                break;
                            case 'tartak':
                                if(gold >= 5 && wood >= 10 && rock >= 5){
                                    gold -=5;
                                    wood -= 10;
                                    rock -= 5;
                                } else break budowa;
                                break;
                            case 'kopalnia':
                                if(gold >= 5 && rock >= 25 && wood >= 10){
                                    gold -=5;
                                    wood -= 10;
                                    rock -= 25;
                                } else break budowa;
                                break;
                            case 'rzemieslnik':
                                if(wood >= 5 && rock >= 15 && iron >= 4){
                                    wood -=5;
                                    rock -= 15;
                                    iron -= 4;
                                } else break budowa;
                                break;
                        }
                        unemploys--;
                        playerPower -= 3;
                    }

                    //mechaniki po postawieniu budynku
                    switch (bulding){
                        case 'las':
                            break;
                        case 'kopalniaI':
                            break;
                        case 'hata':
                                    hauses += 5;
                            break;
                        case 'dom':
                                    hauses += 10;
                            break;
                        case 'kamienica':
                                    hauses += 20;
                            break;
                        case 'market':
                            if(!maMarket){
                                createRecipe(5,wood, 'wood', 3,gold, 'gold', 'market')
                                createRecipe(4,rawIron, 'rawIron', 1,gold, 'gold', 'market')
                                createRecipe(3,iron, 'iron', 2,gold, 'gold', 'market')
                                maMarket=true;
                            }
                            break;
                        case 'pole':
                            break;
                        case 'mlyn':
                            if(!maMlyn){
                                createRecipe(2,wheat, 'wheat', 100,caloric, 'caloric', 'mlyn')
                                maMlyn=true;
                            }
                            break;
                        case 'farma':
                            break;
                        case 'huta':
                            if(!maHuta){
                                createRecipe(2,rawIron, 'rawIron', 1,iron, 'iron', 'huta')
                                maHuta=true;
                            }
                            break;
                        case 'tartak':
                            break;
                        case 'kopalnia':
                            break
                        case 'rzemieslnik':
                            if(!maRzemieslnik){
                                createRecipe(15,rock,'rock',5,healt,'healt','rzemieslnik')
                                maRzemieslnik=true;
                            }
                            break;
                    }

                    // console.log('Build ' + bulding + ' on ' + document.querySelectorAll('.boardSquare')[i].dataset.code)
                    Board[j][1] = bulding;
                    document.querySelectorAll('.boardSquare')[i].querySelector('img').src = 'image/buldings/' + bulding + '.png'
                    document.querySelectorAll('.boardSquare')[i].querySelector('img').alt = 'Budynek: ' + bulding;

                    unhaused = peoples - hauses;

                    refleshResources()

                    break;
                } else if(Board[j][0] == document.querySelectorAll('.boardSquare')[i].dataset.code && Board[j][1] != null && bulding == null && playerPower >= 2){
                    if(!freeBuild){
                        unemploys++;
                        playerPower -= 2;
                    }

                    //usuwanie funkcji po usunięciu budynku
                    switch(Board[j][1]){
                        case 'las':
                            break;
                        case 'kopalniaI':
                            break;
                        case 'hata':
                            hauses -=5;
                            break;
                        case 'dom':
                            hauses -=10;
                            break;
                        case 'kamienica':
                            hauses -=20;
                            break;
                        case 'market':
                            if(maMarket){
                                maMarket=false;
                                delateRecipe('market')
                            }
                            break;
                        case 'pole':
                            break;
                        case 'mlyn':
                            if(maMlyn){
                                maMlyn=false;
                                delateRecipe('mlyn')
                            }
                            break;
                        case 'farma':
                            break;
                        case 'huta':
                            if(maHuta){
                                maHuta=false;
                                delateRecipe('huta')
                            }
                            break;
                        case 'tartak':
                            break;
                        case 'kopalnia':
                            break
                        case 'rzemieslnik':
                            if(maRzemieslnik){
                                maRzemieslnik=false;
                                delateRecipe('rzemieslnik')
                            }
                            break;
                    }

                    Board[j][1] = null;
                    document.querySelectorAll('.boardSquare')[i].querySelector('img').src = 'image/grass.png'
                    document.querySelectorAll('.boardSquare')[i].querySelector('img').alt = null
                    refleshResources()
                }
            }
            resetBuild();
        }
    });
}
//==================
//     Crafting
//==================

//Crafting po kliknięciu receptóry
if(document.querySelectorAll('.recipe') != null){

recip = document.querySelectorAll('.recipe')
for(let i = 0; i < recip.length; i++){
    recip[i].addEventListener('click', function(){
       console.log('Wytworzono item ' + recip[i].dataset.inputMaterial)
       if(recip[i].dataset.inputMaterial >= recip[i].dataset.inputCount){
            recip[i].dataset.inputMaterial -= recip[i].dataset.inputCount;
            recip[i].dataset.outputMaterial += recip[i].dataset.outputCount;
        }
})}}

//Odblokowywanie receptóry w przypadku wybudowania odpowiedniej stacji

//==================
//     FUNKCJE
//==================

//funkcja resetowania budowy
function resetBuild(){
    tips.innerHTML = null
    buldingIsActive = false;
    bulding = null;
    // console.log(buldingIsActive + ' | ' + bulding)
}

//funkcja nowego dnia
function newDay(){
    if(alive){
        day++;
        caloricDemand = 10*peoples;
        caloric -=caloricDemand
        playerPower = (getRandomInt(30)+10);

        //Dofinansowanie podatkowe co 5 dni
        if(day % 5 === 0){
            gold++
        }

        //ostrzeżenie o najeździe dzień przed i wylosowanie jego siły
        if((day + 1) % 10 === 0){
            rainPower++;
            nextRaidPower = (getRandomInt(50 + rainPower*10)+(rainPower*10))
            tip.innerHTML = 'Nasi zwiadowcy zobaczyli coś w oddali! <br> Zbliża się najazd o mocy: '+ nextRaidPower +'! <br> Lepiej się przygotój';
        }
        //Najazd!
        if(day % 10 === 0){
            if(!immunitly){
                let damage = nextRaidPower;
                let defenc = defence;
                
                defenc -= damage;
                if(defenc < 0){
                    healt += defenc
                } else{
                    defence -= damage
                }
            }
            tip.innerHTML = 'Przybył najazd o mocy ' + nextRaidPower + '.<br> Zostało ci ' + healt + ' zdrowia. <br>Udało ci się odeprzeć ' + (defence - nextRaidPower);
        }

        //sprawdzenie możliwości i dodanie ludzi do wioski jeżeli jest taka możliwość
        if(hauses > peoples){
            peoples++
        }

        usedGenerateMoreResources = false;
        document.getElementById('generate').classList.remove('used')
        generateResources();
        refleshResources();
    }

    if(healt <=0 || caloric < 0) alive = false;
    if(!alive) alert('Twoja wioska umarła \nYou Lose');
}

//funkcja aktualizacji WSZYSTKICH statystyk
function refleshResources(){
    document.getElementById("day").innerHTML = "Dzień: " + day;
    document.getElementById("people").innerHTML = "Ludność: " + peoples;

    if(unhaused >= 0)document.getElementById("unhause").innerHTML = "Bezdomni: " + unhaused
    else document.getElementById("unhause").innerHTML = "Bezdomni: 0"

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


//funkcja dodająca receptura
function createRecipe(InputCount, InputMaterial, OutputCount, OutputMaterial, Sponsor){
    //Wyświetlanie Graficzne receptóry
    var recipe = document.createElement('div');
    document.getElementById('recipes').appendChild(recipe);
    recipe.classList.add(Sponsor);
    recipe.classList.add("recipe");

    let labelI = document.createElement('label');
    labelI.textContent = InputCount;

    let imageI = document.createElement('img');
    imageI.src = 'image/resources/'+ InputMaterial + '.png';
    imageI.alt = OutputMaterial;

    let arrow = document.createElement('img');
    arrow.src = 'image/arrow.png';

    let labelO = document.createElement('label');
    labelO.textContent = OutputCount;

    let imageO = document.createElement('img');
    imageO.src = 'image/resources/'+ OutputMaterial + '.png';
    imageO.alt = OutputMaterial;

    recipe.appendChild(labelI);
    recipe.appendChild(imageI);
    recipe.appendChild(arrow);
    recipe.appendChild(labelO);
    recipe.appendChild(imageO);

    //Funkcjonalność receptóry
    recipe.dataset.inputCount = InputCount;
    recipe.dataset.inputMaterial = InputMaterial;
    recipe.dataset.outputCount = OutputCount;
    recipe.dataset.outputMaterial = OutputMaterial;

    recipe.addEventListener('click', e => {
        refleshResources();
    })
}

//funkcja usuwająca wszystkie reseptóry wyszukując po sponsorze
async function delateRecipe(Sponsor){
    let startLength = document.querySelectorAll('.' + Sponsor).length
    for(let i = 0; i < startLength; i++){
        document.querySelectorAll('.' + Sponsor)[0].remove()
    }
}

//funkcja generująca zasoby z postawionych budynków
function generateResources(){
    for (let i = 0; i < Board.length; i++) {
        switch (Board[i][1]){
            case 'las':
                wood += 3;
                caloric += 20;
                break;
            case 'kopalniaI':
                rock += 5;
                break;
            case 'hata':
                
                break;
            case 'dom':
                break;
            case 'kamienica':
                gold += 1;
                break;
            case 'market':

                break;
            case 'pole':
                wheat += 3;
                break;
            case 'mlyn':
                // if(wheat >= 2){
                //     wheat -= 2;
                //     caloric += 100;
                // }
                break;
            case 'farma':
                wheat += 2;
                caloric += 150;
                break;
            case 'huta':
                
                break;
            case 'tartak':
                wood += 10;
                break;
            case 'rzemieslnik':
                break;
            case 'kopalnia':
                rock += 10;
                rawIron += 2;
                if(getRandomInt(1) == 1){gold += 1;}
                break;
        }
    }

    if(maRzemieslnik){
        if(alive && healt < 100){
            healt += 5;
        }
    }

    defence += 2*warriors;
}
