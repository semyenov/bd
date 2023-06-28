import { consola } from 'consola'

import type { Move, Player } from './player'

import type { Position } from './utils'
import { EMPTY_MARK } from './utils'

class Game {
  private readonly _players: Player[]

  private _turn: number
  private _playerId: Player['id'] | null

  public readonly size: number
  board: string[][]

  get turn(): number {
    return this._turn
  }

  get playerId(): Player['id'] | null {
    return this._playerId
  }

  constructor(players: Player[], size: number, word: string) {
    this._turn = 0 // Start with the first player
    this._players = players
    this._playerId = null

    this.size = size
    this.board = Game.createBoard(size, word)
  }

  /**
  * Asynchronously plays a game until it is over and declares the winner.
  *
  * @return {AsyncGenerator<void>} An async generator that yields nothing.
  * @throws {Error} If an invalid move is made.
  */
  async *next(): AsyncGenerator<Move> {
    while (!this.isOver()) {
      let done = false
      const player = this.getNextPlayer()

      while (!done) {
        const move = await player.move(this)
        if (move) {
          yield move

          this._turn += 1
          done = this.addLetter(player, move.x, move.y, move.letter)
        }
      }
    }

    const winner = this.getWinner()
    consola.log(`And the winner is: ${winner}`)
  }

  /**
   * Creates a board of the specified size and optionally places a word on it.
   *
   * @param {number} size - The size of the board.
   * @param {string} [word] - The word to be placed on the board. (optional)
   * @return {string[][]} - The created board.
   */

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
    return this._players[this._turn % this._players.length]!
  }

  /**
  * Returns the player object with the highest score.
  *
  * @return {Player} The player object with the highest score.
  */
  getWinner(): Player {
    for (let i = 0; i < this._players.length - 1; i++) {
      if (this._players[i]!.score > this._players[i + 1]!.score)
        return this._players[i]
    }

    return this._players[0]
  }

  /**
  * Check if the game is over.
  *
  * @return {boolean} True if the game is over, false otherwise.
  */
  isOver(): boolean {
    // if the whole board is full, the game is over
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === EMPTY_MARK)
          return false
      }
    }

    return true
  }

  static createBoard(size: number, word?: string): string[][] {
    const board = Array.from({ length: size }, () => Array(size).fill(EMPTY_MARK))

    if (word) {
      const wordStart: Position = [
        Math.floor(size / 2),
        Math.floor(size / 2) - Math.floor(word.length / 2),
      ]
      for (let j = 0; j < word.length; j++)
        board[wordStart[0]][wordStart[1] + j] = word[j]
    }

    return board
  }
}

export { Game }
