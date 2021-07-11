// Цвета пар карточек (10 штук)
let COLORS = ["red", "orangered", "gold", "forestgreen", "cornflowerblue", "darkslateblue", "darkviolet", "burlywood", "oliveddrab", "sienna"];
class Card {
    constructor(num, game) {
        this.cardNumber = num;
        this.CreateCardElement();
        this.currentGame = game;
    }
    /*
        <div class="flippable-card">
            <div class="front">Номер карты</div>
            <div class="back">?</div>
        </div>
    */
    CreateCardElement() {
        let flippableElement = document.createElement("div");
        flippableElement.classList.add("flippable-card");
        // Создать элемент лицевой стороны, но не вставлять его, чтобы через html нельзя было подсмотреть карточки.
        let front = document.createElement("div");
        front.classList.add("front");
        front.setAttribute("style", "color: " + COLORS[this.cardNumber - 1]);
        front.innerHTML = this.cardNumber.toString();
        this.frontElement = front;
        // Создать элемент задней стороны.
        let back = document.createElement("div");
        back.classList.add("back");
        back.innerHTML = "?";
        flippableElement.appendChild(back);
        flippableElement.addEventListener('click', this.onClick.bind(this));
        this.flippableElement = flippableElement;
    }
    // Повернуть карточку цифрой вверх.
    Flip() {
        this.isFlipped = true;
        this.flippableElement.classList.add("flipped");
        // Добавить в html лицевую сторону.
        this.flippableElement.appendChild(this.frontElement);
    }
    // Повернуть карточку цифрой вниз.
    Unflip() {
        this.isFlipped = false;
        this.flippableElement.classList.remove("flipped");
        // Убрать из html лицевую сторону.
        setTimeout(() => this.flippableElement.removeChild(this.frontElement), 400);
    }
    // Заблокировать карточку (становится серой).
    Lock() {
        this.flippableElement.classList.add("locked");
    }
    onClick() {
        if (!this.isFlipped) {
            this.currentGame.OnFlipAction(this);
        }
    }
}
class Game {
    constructor(cardsPerLevel = 2, startLevel = 1, baseCardCount = 2, maxLevel = 10) {
        this.currentScore = 0;
        this.boardElement = document.getElementById("board");
        this.minutesElement = document.getElementById("timer-min");
        this.secondsElement = document.getElementById("timer-sec");
        this.levelElement = document.getElementById("level");
        this.scoreElement = document.getElementById("score");
        // Задать кнопкам действия при клике.
        this.levelCompleteElement = document.getElementById("level-complete");
        this.continueElement = document.getElementById("continue");
        this.continueElement.addEventListener('click', this.OnContinue.bind(this));
        this.giveUpElement = document.getElementById("give-up");
        this.giveUpElement.addEventListener('click', this.OnGiveUp.bind(this));
        this.cardsPerLevel = cardsPerLevel;
        this.baseCardCount = baseCardCount;
        this.startLevel = startLevel;
        this.maxLevel = maxLevel;
        // Начать таймер.
        this.startTimeMiliseconds = Date.now();
        this.timerID = setInterval(() => this.UpdateTimer(), 1000);
        // Установить уровень и создать карты на доске.
        this.SetLevel(this.startLevel);
        this.PopulateBoard();
    }
    // Обнулить значения и т.д.
    ResetGame() {
        this.currentScore = 0;
        this.scoreElement.innerHTML = "0";
        this.startTimeMiliseconds = Date.now();
        this.minutesElement.innerHTML = "00";
        this.secondsElement.innerHTML = "00";
        this.timerID = setInterval(() => this.UpdateTimer(), 1000);
        this.SetLevel(this.startLevel);
        this.PopulateBoard();
    }
    // Установить уровень.
    SetLevel(new_lvl) {
        this.flippedPairsCount = 0;
        this.currentLevel = new_lvl;
        this.levelElement.innerHTML = this.currentLevel.toString();
        // Кол-во карт, пример (уровень 4, Карт на уровень 2): 2 + 4 * 2 = 10 карт на уровне 4.
        this.currentCardCount = this.baseCardCount + this.currentLevel * this.cardsPerLevel;
    }
    // При нажатии на карту.
    OnFlipAction(newFlippedCard) {
        // Если уже есть перевернутая карта.
        if (this.lastFlippedCard != undefined) {
            // Если две перевернутые карты совпали.
            if (newFlippedCard.cardNumber == this.lastFlippedCard.cardNumber) {
                // Перевернуть обе карты цифрой вверх и заблокировать.
                newFlippedCard.Flip();
                newFlippedCard.Lock();
                this.lastFlippedCard.Lock();
                // Обнулить последнюю перевернутую.
                this.lastFlippedCard = undefined;
                // Добавить очки
                this.currentScore += 10;
                this.scoreElement.innerHTML = this.currentScore.toString();
                this.flippedPairsCount += 1;
                if (this.flippedPairsCount == this.currentCardCount / 2) {
                    // Был пройден финальный уровень.
                    if (this.currentLevel == this.maxLevel) {
                        setTimeout(() => this.OnGameFinished(), 500);
                    }
                    // Не финальный.
                    else {
                        setTimeout(() => this.OnLevelFinished(), 500);
                    }
                }
            }
            // Если перевернутные карты не совпали.
            else {
                // Уменьшить очки, но не меньше 0.
                this.currentScore -= 5;
                if (this.currentScore < 0) {
                    this.currentScore = 0;
                }
                this.scoreElement.innerHTML = this.currentScore.toString();
                // Перевернуть обе карты цифрой вверх, перевернуть их обратно через 1 сек.
                newFlippedCard.Flip();
                // Запомнить, что последнюю перевернутую надо перевернуть обратно, и обнуть ее.
                let cardToUnflip = this.lastFlippedCard;
                this.lastFlippedCard = undefined;
                setTimeout(() => this.UnflipTwoCards(newFlippedCard, cardToUnflip), 1000);
            }
            // Если нет перевернутой, то установить последнюю перевернутую.
        }
        else {
            newFlippedCard.Flip();
            this.lastFlippedCard = newFlippedCard;
        }
    }
    UnflipTwoCards(card1, card2) {
        card1.Unflip();
        card2.Unflip();
    }
    //При прохождении уровня, показать кнопку "continue".
    OnLevelFinished() {
        this.levelCompleteElement.classList.remove("hidden");
    }
    // При нажатии "continue", пересоздаь доску и перейти на следующий уровень.
    OnContinue() {
        if (this.flippedPairsCount != 0) {
            this.levelCompleteElement.classList.add("hidden");
            this.SetLevel(this.currentLevel + 1);
            this.PopulateBoard();
        }
    }
    // Ресетнуть игру когда сдаемся.
    OnGiveUp() {
        clearInterval(this.timerID);
        alert("You have given up!");
        this.ResetGame();
    }
    // При завершении финального уровня, посчитать финальный счет, ресетнуть значения и перейти на начальный уровень.
    OnGameFinished() {
        // Остановить таймер.
        clearInterval(this.timerID);
        // Очки, полученые во время игры.
        let flippingScore = this.currentScore;
        // Очки от времени (20 - примерное среднее время прохождения одного уровня)
        let timerScore = Math.floor((this.maxLevel - this.currentTimeSeconds / 20) * 100);
        // Финальный счет.
        let finalScore = flippingScore + timerScore;
        alert("Game over! \nFlipping score: " + flippingScore + "\nScore from time: " + timerScore + "\nFinal score: " + finalScore);
        this.ResetGame();
    }
    // Каждую секунду обновнять таймер.
    UpdateTimer() {
        let now = Date.now();
        let timeDelta = now - this.startTimeMiliseconds;
        let milsToSecs = Math.floor(timeDelta / 1000);
        this.currentTimeSeconds = milsToSecs;
        let mins = Math.floor(milsToSecs / 60);
        let secs = Math.floor(milsToSecs % 60);
        if (mins < 10) {
            this.minutesElement.innerHTML = "0" + mins;
        }
        else {
            this.minutesElement.innerHTML = mins.toString();
        }
        if (secs < 10) {
            this.secondsElement.innerHTML = "0" + secs;
        }
        else {
            this.secondsElement.innerHTML = secs.toString();
        }
    }
    // Заполнить доску картами.
    PopulateBoard() {
        // Вычислить размеры доски, т.е 3x3, 4x4, 5x5 и т.д.
        let board_width = 1;
        while (true) {
            if (this.currentCardCount <= board_width * board_width) {
                break;
            }
            else {
                board_width++;
            }
        }
        // Создать массив случайно расположенных пар номеров.
        let numberArray = [];
        for (let i = 0; i < this.currentCardCount; i++) {
            // Выбираем случайное число от 1 до кол-ва карт.
            numberArray[i] = this.GetRandomNumber(1, this.currentCardCount / 2);
            let containsOnce = false;
            let containsTwice = false;
            // Пройти по уже существующим числам в массиве.
            for (let j = 0; j < i; j++) {
                // Если встречаем выбранное число первый раз то containsOnce = true;
                if (!containsOnce) {
                    if (numberArray[i] == numberArray[j])
                        containsOnce = true;
                    // Если втречаем выбранное число второй раз то containsTwice = true;
                }
                else {
                    if (numberArray[i] == numberArray[j])
                        containsTwice = true;
                }
                // Если встретили выбранное число два раза, то это значит, что пара уже сущесвутет.
                if (containsOnce && containsTwice) {
                    // тогда отступаем на 1 шаг и генерируем другое число,  чтобы попробовать еще раз.
                    i--;
                    break;
                }
            }
        }
        // Создаем 2D массив карточек и очищаем таблицу в html.
        this.cardArray = [];
        this.boardElement.innerHTML = "";
        for (let i = 0; i < board_width; i++) {
            this.cardArray[i] = [];
            let row = this.boardElement.insertRow();
            for (let j = 0; j < board_width; j++) {
                // Сопоставлем значения i и j с индексом числа в массиве пар чисел, берем это число.
                let num = numberArray[(i * board_width) + j];
                // Создаем карту, на лицевой части которой находится выбранное число.
                let card = new Card(num, this);
                // Добавляем карту в массив карт и вставляем ту карту в таблицу html.
                this.cardArray[i][j] = card;
                let cell = row.insertCell();
                cell.appendChild(card.flippableElement);
            }
        }
    }
    // Рандомное число от min до max.
    GetRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
const currGame = new Game(2, 1, 2, 5);
