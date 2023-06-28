import { consola } from 'consola'
import type { Move, Player } from './player'

import { EMPTY_MARK } from './utils'

class Game {
  private _turn: number

  size: number
  players: Player[]
  board: string[][]

  get turn(): number {
    return this._turn
  }

  constructor(players: Player[], size: number, word: string) {
    this._turn = 0 // Start with the first player

    this.size = size
    this.players = players
    this.board = Array(size)
      .fill(EMPTY_MARK)
      .map(() =>
        Array(size).fill(EMPTY_MARK),
      )

    // setting up the starting word in the middle of the board
    const x = Math.floor(size / 2)
    const y = Math.floor(size / 2) - Math.floor(word.length / 2)
    for (let j = 0; j < word.length; j++)
      this.board[x][y + j] = word[j]
  }

  /**
* Asynchronously plays a game until it is over and declares the winner.
*
* @return {AsyncGenerator<void>} An async generator that yields nothing.
* @throws {Error} If an invalid move is made.
*/
  async *next(): AsyncGenerator<Move> {
    while (!this.isGameOver()) {
      let done = false
      const player = this.getNextPlayer()

      while (!done) {
        const move = await player.makeMove(this)
        if (move) {
          yield move

          this._turn += 1
          done = this.addLetter(player, move.x, move.y, move.letter)
        }
      }
    }

    const winner = this.getWinnerPlayer()
    consola.log(`And the winner is: ${winner}`)
  }

  /**
   * Adds a letter to the board at the given coordinates for the specified player.
   *
   * @param {Player} player - The player who is making the move.
   * @param {number} x - The x-coordinate of the position on the board.
   * @param {number} y - The y-coordinate of the position on the board.
   * @param {string} letter - The letter to be added to the board.
   * @return {boolean} True if the letter was successfully added, false otherwise.
   */
  addLetter(player: Player, x: number, y: number, letter: string): boolean {
    // Here goes the logic to add the letter to the board.
    // Should also verify that the move is valid and that the word hasn't been used.
    if (this.checkMove(player, x, y, letter)) {
      this.board[x][y] = letter
      return true
    }

    return false
  }

  checkMove(player: Player, x: number, y: number, letter: string): boolean {
    // Check if the coordinates are within the game board
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
      consola.log('Invalid move: Position out of bounds.')
      return false
    }

    // Check if the space is not already occupied
    if (this.board[x][y] !== EMPTY_MARK) {
      consola.log('Invalid move: The spot is already occupied.')
      return false
    }

    // Check if the player's letter is in their own set of letters
    if (!player.getLetters().includes(letter)) {
      consola.log('Invalid move: The player does not have this letter.')
      return false
    }

    return true
  }

  // Returns which player's turn is it
  getNextPlayer(): Player {
    return this.players[this._turn % this.players.length]!
  }

  /**
  * Returns the player object with the highest score.
  *
  * @return {Player} The player object with the highest score.
  */
  getWinnerPlayer(): Player {
    for (let i = 0; i < this.players.length - 1; i++) {
      if (this.players[i]!.score > this.players[i + 1]!.score)
        return this.players[i]
    }

    return this.players[0]
  }

  /**
  * Check if the game is over.
  *
  * @return {boolean} True if the game is over, false otherwise.
  */
  isGameOver(): boolean {
    // if the whole board is full, the game is over
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === EMPTY_MARK)
          return false
      }
    }

    return true
  }
}

export { Game }
