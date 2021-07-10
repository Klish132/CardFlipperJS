import {Card} from "Scripts/Card";

export class Game {
    public card_array: Card[][];
    private current_flipped_Card: Card;
    public score: number;

    public level_num: number;
    public cards_per_level: number;
    public card_count: number;
    

    constructor(cpl: number = 2) {
        console.log("s");
        this.score = 0;
        this.cards_per_level = cpl;

        this.SetLevel(1);
        this.PopulateBoard();
    }

    private SetLevel(new_lvl: number) {
        this.level_num = new_lvl;
        this.card_count = this.level_num * this.cards_per_level;
    }

    private PopulateBoard(): void {
        let board_width: number = 1;
        while(true) {
            if (this.card_count <= board_width * board_width) {
                break;
            } else {
                board_width++;
            }
        }
        let num_array: number = new Number[this.card_count];
        for (let i = 0; i < this.card_count; i++) {
            num_array[i] = this.GetRandomNumber(1, this.card_count / 2);
            let contains_once: boolean = false;
            let contains_twice: boolean = false;

            for (let j = 0; j < i; j++) {
                if (!contains_once) {
                    if (num_array[i] == num_array[j])
                        contains_once = true;
                } else {
                    if (num_array[i] == num_array[j])
                        contains_twice = true;
                }
            }
        }
        this.card_array = new Card[board_width][board_width];
        for (let i = 0; i < board_width; i++) {
            for (let j = 0; j < board_width; j++) {
                let num: number = num_array[(i * board_width) + j];
                this.card_array[i][j] = new Card(num, i * 10, j * 10);
            }
        }
    }

    private GetRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}