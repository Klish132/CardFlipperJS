// Цвета пар карточек (10 штук)
let COLORS = ["red", "orangered", "gold", "forestgreen", "cornflowerblue", "darkslateblue", "darkviolet", "burlywood", "oliveddrab", "sienna"];

class Card {
    // Номер на лицевой стороне карты.
    public cardNumber: number;
    // Перевернутая ли карта.
    public isFlipped: boolean;
    // Element HTML карты.
    public flippableElement: Element;

    private currentGame: Game;

    constructor(num: number, game: Game) {
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
    private CreateCardElement() {
        let flippableElement = document.createElement("div",);
        flippableElement.classList.add("flippable-card");

        let front = document.createElement("div");
        front.classList.add("front");
        front.setAttribute("style", "color: " + COLORS[this.cardNumber - 1]);
        front.innerHTML = this.cardNumber.toString();
        flippableElement.appendChild(front);

        let back = document.createElement("div");
        back.classList.add("back");
        back.innerHTML = "?";
        flippableElement.appendChild(back);

        flippableElement.addEventListener('click', this.onClick.bind(this));
        this.flippableElement = flippableElement;
    }

    // Повернуть карточку цифрой вверх.
    public Flip() {
        this.isFlipped = true;
        this.flippableElement.classList.add("flipped");
    }

    // Повернуть карточку цифрой вниз.
    public Unflip() {
        this.isFlipped = false;
        this.flippableElement.classList.remove("flipped");
    }

    // Заблокировать карточку (становится серой).
    public Lock() {
        this.flippableElement.classList.add("locked");
    }

    private onClick() {
        if (!this.isFlipped) {
            this.currentGame.OnFlipAction(this);
        }
    }
}

class Game {
    private cardArray: Card[][];
    public lastFlippedCard: Card;
    // Кол-во решенных пар.
    private flippedPairsCount: number;

    private currentScore: number = 0;
    // Начало отчета времени в мс.
    private startTimeMiliseconds: number;
    // Кол-во прошедших с начала игры секунд.
    private currentTimeSeconds: number;
    private timerID: number;
    // Начальный уровень (default 1)
    private startLevel: number;
    // Текущий уровень.
    private currentLevel: number;
    // Номер финального уровня (def 5).
    private maxLevel: number;

    // Сколько карт добавляется на каждом уровне (def 2).
    private cardsPerLevel: number;
    // Кол-во карт на текущем уровне.
    private currentCardCount: number;
    // Изначальное кол-во карт (def 2).
    private baseCardCount: number;
    
    // Elements
    private boardElement: HTMLTableElement;
    private minutesElement: Element;
    private secondsElement: Element;
    private levelElement: Element;
    private scoreElement: Element;

    private levelCompleteElement: Element;
    private continueElement: Element;
    private giveUpElement: Element;

    constructor(cardsPerLevel: number = 2, startLevel: number = 1, baseCardCount: number = 2, maxLevel: number = 10) {
        this.boardElement = <HTMLTableElement> document.getElementById("board");
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
    private ResetGame() {
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
    private SetLevel(new_lvl: number) {
        this.flippedPairsCount = 0;
        this.currentLevel = new_lvl;
        this.levelElement.innerHTML = this.currentLevel.toString();
        // Кол-во карт, пример (уровень 4, Карт на уровень 2): 2 + 4 * 2 = 10 карт на уровне 4.
        this.currentCardCount = this.baseCardCount + this.currentLevel * this.cardsPerLevel;
    }

    // При нажатии на карту.
    public OnFlipAction(newFlippedCard: Card) {
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
        } else {
            newFlippedCard.Flip();
            this.lastFlippedCard = newFlippedCard;
        }
    }

    private UnflipTwoCards(card1: Card, card2: Card) {
        card1.Unflip();
        card2.Unflip();
    }

    //При прохождении уровня, показать кнопку "continue".
    private OnLevelFinished() {
        this.levelCompleteElement.classList.remove("hidden");
    }

    // При нажатии "continue", пересоздаь доску и перейти на следующий уровень.
    private OnContinue() {
        if (this.flippedPairsCount != 0) {
            this.levelCompleteElement.classList.add("hidden");
            this.SetLevel(this.currentLevel + 1);
            this.PopulateBoard();
        }
    }

    // Ресетнуть игру когда сдаемся.
    private OnGiveUp() {
        clearInterval(this.timerID);
        alert("You have given up!");
        this.ResetGame();
    }

    // При завершении финального уровня, посчитать финальный счет, ресетнуть значения и перейти на начальный уровень.
    private OnGameFinished() {
        // Остановить таймер.
        clearInterval(this.timerID);
        // Очки, полученые во время игры.
        let flippingScore = this.currentScore;
        // Очки от времени (20 - примерное среднее время прохождения одного уровня)
        let timerScore =  Math.floor((this.maxLevel - this.currentTimeSeconds / 20) * 100);
        // Финальный счет.
        let finalScore = flippingScore + timerScore;
        alert("Game over! \nFlipping score: " + flippingScore + "\nScore from time: " + timerScore + "\nFinal score: " + finalScore);
        this.ResetGame();
    }

    // Каждую секунду обновнять таймер.
    public UpdateTimer() {
        let now = Date.now();
        let timeDelta = now - this.startTimeMiliseconds;
        let milsToSecs = Math.floor(timeDelta / 1000);
        this.currentTimeSeconds = milsToSecs;
        let mins = Math.floor(milsToSecs / 60);
        let secs = Math.floor(milsToSecs % 60);

        if (mins < 10) {
            this.minutesElement.innerHTML = "0" + mins;
        } else {
            this.minutesElement.innerHTML = mins.toString();
        }
        if (secs < 10) {
            this.secondsElement.innerHTML = "0" + secs;
        } else {
            this.secondsElement.innerHTML = secs.toString();
        }
    }

    // Заполнить доску картами.
    private PopulateBoard() {
        // Вычислить размеры доски, т.е 3x3, 4x4, 5x5 и т.д.
        let board_width: number = 1;
        while(true) {
            if (this.currentCardCount <= board_width * board_width) {
                break;
            } else {
                board_width++;
            }
        }
        // Создать массив случайно расположенных пар номеров.
        let numberArray: number[] = [];
        for (let i = 0; i < this.currentCardCount; i++) {
            // Выбираем случайное число от 1 до кол-ва карт.
            numberArray[i] = this.GetRandomNumber(1, this.currentCardCount / 2);
            let containsOnce: boolean = false;
            let containsTwice: boolean = false;

            // Пройти по уже существующим числам в массиве.
            for (let j = 0; j < i; j++) {
                // Если встречаем выбранное число первый раз то containsOnce = true;
                if (!containsOnce) {
                    if (numberArray[i] == numberArray[j])
                        containsOnce = true;
                // Если втречаем выбранное число второй раз то containsTwice = true;
                } else {
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
                let num: number = numberArray[(i * board_width) + j];
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
    private GetRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

const currGame = new Game(2, 1, 2, 5);