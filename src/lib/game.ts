import { consola } from 'consola'
import type { Trie } from './dictionary'
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
   * Adds a letter to the board at the given coordinates for the specified player.
   *
   * @param {Player} player - The player who is making the move.
   * @param {number} x - The x-coordinate of the position on the board.
   * @param {number} y - The y-coordinate of the position on the board.
   * @param {string} letter - The letter to be added to the board.
   * @return {boolean} True if the letter was successfully added, false otherwise.
   */
  addLetter(player: Player, x: number, y: number, letter: string) {
    // Here goes the logic to add the letter to the board.
    // Should also verify that the move is valid and that the word hasn't been used.
    if (this.checkMove(player, x, y, letter)) {
      this.board[x][y] = letter
      return true
    }
    else {
      return false
    }
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
   * Asynchronously plays a game until it is over and declares the winner.
   *
   * @return {Promise<void>} Nothing is returned from this function.
   * @throws {Error} If an invalid move is made.
   */
  async playGame(): Promise<void> {
    while (!this.gameOverFlag()) {
      const player = this.getNextPlayer()

      // Ask the player to make a move until a valid move is made
      let madeMove = false
      while (!madeMove) {
        const move: Move | null = await player.makeMove(this)
        if (!move)
          throw new Error('Invalid move')

        madeMove = this.addLetter(player, move.x, move.y, move.letter)
      }

      // After a valid move has been made, increment the turn
      this._turn += 1
    }

    // After the game is over, declare the winner. A "getWinner" function should be implemented according to your scoring system
    const winner = this.getWinner()
    consola.log(`The winner is: Player ${winner}`)
  }

  /**
   * Returns the player object with the highest score.
   *
   * @return {Player} The player object with the highest score.
   */
  getWinner(): Player {
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
  gameOverFlag(): boolean {
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

class Move {
  player: Player
  x: number
  y: number
  letter: string

  constructor(player: Player, x: number, y: number, letter: string) {
    this.player = player
    this.x = x
    this.y = y
    this.letter = letter
  }
}

class Player {
  name: string
  score: number
  trie: Trie

  constructor(name: string, trie: Trie) {
    this.name = name
    // A player begins without score
    this.score = 0
    // Initializes a trie for the player
    this.trie = trie
  }

  // makeMove should make decision based on the game state
  // and return a Move object
  makeMove(game: Game): Promise<Move | null> {
    // For simplicity, let's assume that the player choose a random empty cell and add a random letter

    // Generate a random position x,y on the board
    let x, y
    do {
      x = Math.floor(Math.random() * game.size)
      y = Math.floor(Math.random() * game.size)
    } while (game.board[x]![y]! !== EMPTY_MARK)

    // Generate a random letter
    const letter = String.fromCharCode('А'.charCodeAt(0) + Math.floor(Math.random() * 33))

    return Promise.resolve(new Move(this, x, y, letter))
  }

  getLetters(): string[] {
    return [...this.trie.root.children.keys()]
  }
}

export { Game, Move, Player }
