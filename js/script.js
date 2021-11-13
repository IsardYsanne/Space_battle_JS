// 'use strict';
// document.addEventListener("DOMContentLoaded", function func(){});
    var view = {
        displayMessage: function(message){
            var messageBlock = document.querySelector('#message');
            messageBlock.innerHTML = message;
        },
        displayHit: function(local){ //local - куда стреляли
            var shot = document.getElementById(local);
            shot.setAttribute("class", "hit");
        },
        displayMiss: function(local){
            var shot = document.getElementById(local);
            shot.setAttribute("class", "miss");
        }
    };

//=============== Модель поведения игры


    var model = {
        sizeSpace: 7, //размер поля 7х7
        numShips: 3, // количество крейсеров
        shipLength: 3, // длина крейсеров
        shipsDestroyed: 0, // количество разрушенных вначале
        ships: [
            {   
                locals: [0, 0, 0], //местонахождение крейсера, состоит из 3х точек
                hits: ['', '', ''] // попадания игрока
            }, 
            {
                locals: [0, 0, 0],
                hits: ['', '', '']
            }, 
            {
                locals: [0, 0, 0],
                hits: ['', '', '']
            }
        ],
        fire: function(guess) { // получение координaтов выстрела
            for(var i = 0; i < this.numShips; i++){
                var ship = this.ships[i]; //получаем объект

                loc = ship.locals; //получаем координаты
                var index = loc.indexOf(guess); // ищет guess в loc

                if (ship.hits[index] === "hit") {
                    view.displayMessage("Ты уже стрелял сюда!");
                    return true;
                } else if (index >= 0) {
                    ship.hits[index] = 'hit';
                    view.displayHit(guess);
                    view.displayMessage('Подбил!');
    
                    if(this.destroy(ship)){ //если крейсер уже разрушен
                        view.displayMessage('Разрушил!');
                        this.shipsDestroyed++;
                    }
                    return true;
                }
            }
            view.displayMiss(guess);
            view.displayMessage('Не попал! :(');
            return false;
        },

        destroy: function(ship){ // крушим крейсер, если в 3 точки попали
            for(var i = 0; i < this.shipLength; i++){
                if(ship.hits[i] !== 'hit'){ // если есть хотя бы одна клетка, куда не попал игрок
                    return false;
                }
            }
            return true;
        },

        //Рандомайзер для генерирования расположения крейсеров
        randomeShipLocation: function(){  // создает массив ships
            var locals;
            for(var i = 0; i < this.numShips; i++){
                do{
                    locals = this.randomeShip(); //генерим позицию (верт или горизонт положение)
                }while(this.intersectionShip(locals)); 
                this.ships[i].locals = locals;
            }
		    console.log("Массив космических кораблей: " + this.ships);
        },

        randomeShip: function(){ // генерит координаты одного крейсера
            var rand = Math.floor(Math.random() * 2); // 0 или 1
            var row, col;

            if (rand === 1) { // по гориз
                row = Math.floor(Math.random() * this.sizeSpace);
                col = Math.floor(Math.random() * (this.sizeSpace - this.shipLength + 1));
            } else { // по вертикали
                row = Math.floor(Math.random() * (this.sizeSpace - this.shipLength + 1));
                col = Math.floor(Math.random() * this.sizeSpace);
            }

            var newShipLocs = [];
            for (var i = 0; i < this.shipLength; i++) {
                if (rand === 1) {
                    newShipLocs.push(row + "" + (col + i));
                } else {
                    newShipLocs.push((row + i) + "" + col);
                }
            }
            return newShipLocs;
        },

        intersectionShip: function(locals){ //крейсеры могут генерироваться впритык к другому
            for (var i = 0; i < this.numShips; i++) {
                var ship = this.ships[i];
                for (var j = 0; j < locals.length; j++) {
                    if (ship.locals.indexOf(locals[j]) >= 0) {
                        return true;
                    }
                }
            }
            return false;
        }
    };

//=============== Контроллер, обрабатывает координаты guess, обрабатывает

let controller = { //получение и вывод инфы

    guesses: 0, //отслеживаем кол-во выстрелов
    shot: function(guess){ 

        var location = coordinatesValid(guess); //получаем координаты 

		if(location){
			this.guesses++; //делаем выстрел
			var hit = model.fire(location); // получение координaтов выстрела
			if(hit && model.shipsDestroyed === model.numShips){
				view.displayMessage("Все космические корабли были разрушены за: " + this.guesses + " выстрелов");
			}
		}
    }
}

function coordinatesValid(guess){
    var letters = ["A", "B", "C", "D", "E", "F", "G"];

    if(guess === null || guess.length !== 2){ //валидация введенных данных
		alert("Ошибка ввода");
	}else{
		firstChar = guess.charAt(0); //получаем первый символ в введенном юзером слове
		var row = letters.indexOf(firstChar); //ищем индекс нахождения  символа в массиве letters, возвр 1 или -1
		var column = guess.charAt(1);
        //console.log(row);

		if(isNaN(row) || isNaN(column)){
			alert("Ошибка ввода");
		}else if(row < 0 || column < 0 || row >= model.sizeSpace || column >= model.sizeSpace){
			alert("Ошибка ввода");
		}else{
			return row + column; //1 0 (горизонтальный 0)
		}
	}
	return null;
}
//console.log(coordinatesValid("B0")); // 10
//console.log(coordinatesValid("M3")); //err

//controller.shot("B0"); //Ранил
//controller.shot("A0"); //мимо

//=============== Обработчик кнопки

function formInput() {
	var button = document.getElementById("fire");
    button.addEventListener("click", btnHandler);
	
	var guessInput = document.getElementById('guessInput'); //для enter
    guessInput.addEventListener("keyup", InputHandler);

	model.randomeShipLocation();
}

function btnHandler(){
	var guessInput = document.getElementById('guessInput');
	var guess = guessInput.value; //в перем получаем значение введенных юзером координат
	controller.shot(guess); // ранил либо мимо

	guessInput.value = ""; 
}

function InputHandler(event){ //обработчик для enter
	var button = document.getElementById("fire");
	if(event.code === "Enter"){
		button.click();
		return false;
	}
}

window.onload = formInput;