export class Card {
    public card_num: number;
    private posX: number;
    private posY: number;

    constructor(num: number, x: number, y: number) {
        this.card_num = num;
        this.posX = x;
        this.posY = y;
    }
}