import { Metaphone } from 'natural/lib/natural/phonetics'
import { WordTokenizer } from 'natural/lib/natural/tokenizers'
import type { Game } from './game'
import type { Trie } from './dictionary'
import { EMPTY_MARK } from './utils'

const tokenizer = new WordTokenizer()
const metaphone = Metaphone

class Move {
  player: Player
  letter: string
  x: number
  y: number

  constructor(player: Player, x: number, y: number, letter: string) {
    this.player = player
    this.x = x
    this.y = y
    this.letter = letter
  }
}

class Player {
  trie: Trie

  score: number
  name: string

  constructor(name: string, trie: Trie) {
    // Initializes a trie for the player
    this.trie = trie

    this.score = 0
    this.name = name
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
    } while (game.board[x][y] !== EMPTY_MARK)

    // Generate a random letter
    const letter = String.fromCharCode('А'.charCodeAt(0) + Math.floor(Math.random() * 33))
    return Promise.resolve(new Move(this, x, y, letter))
  }

  getLetters(): string[] {
    return [...this.trie.root.children.keys()]
  }
}

type Strategy = 'easy' | 'hard' | 'choke'

class Bot extends Player {
  constructor(name: string, trie: Trie) {
    super(name, trie)
  }

  /**
   * Makes a move in the game using the specified strategy.
   *
   * @param {Game} game - The game object.
   * @param {Strategy} [strategy='easy'] - The move strategy to use (default: 'easy').
   * @return {Promise<Move | null>} A promise that resolves to the chosen move, or null if no move was made.
   */
  makeMove(
    game: Game,
    strategy: Strategy = 'hard',
  ): Promise<Move | null> {
    const tokenizedBoard
      = tokenizer.tokenize(game.board.join(' ').toUpperCase()) || []

    switch (strategy) {
      case 'easy': return this.chooseRandomMove(game, tokenizedBoard)
      case 'hard': return this.chooseBestMove(game, tokenizedBoard)
      case 'choke': return this.chooseChokerMove(game, tokenizedBoard)
      default: throw new Error('Invalid move strategy')
    }
  }

  /**
   * Chooses a random move from the available empty spots on the game board.
   *
   * @param {Game} game - The game object.
   * @param {string[]} tokenizedBoard - The tokenized board array.
   * @return {Promise<Move | null>} A promise that resolves to a Move object or null if no valid moves are available.
   */
  async chooseRandomMove(game: Game, tokenizedBoard: string[]): Promise<Move | null> {
    const emptySpots: { x: number; y: number }[] = []
    for (let i = 0; i < game.size; i++) {
      for (let j = 0; j < game.size; j++) {
        if (game.board[i]![j] === EMPTY_MARK)
          emptySpots.push({ x: i, y: j })
      }
    }

    // If there are no valid moves available, return null
    if (emptySpots.length === 0)
      return null

    // Randomly pick a spot from the list
    const randomIndex = Math.floor(Math.random() * emptySpots.length)
    const randomSpot = emptySpots[randomIndex]
    if (!randomSpot)
      return null

    const letterIndex = Math.floor(Math.random() * 26)
    const similarWords = tokenizedBoard.filter(word =>
      metaphone.compare(
        metaphone.process(word),
        metaphone.process(String.fromCharCode(65 + letterIndex)),
      ),
    )

    const letter = similarWords.length > 0
      ? similarWords[0][0]
      : String.fromCharCode(65 + letterIndex)
    const { x, y } = randomSpot

    return new Move(this, x, y, letter || EMPTY_MARK)
  }

  async chooseBestMove(game: Game, tokenizedBoard: string[]): Promise<Move | null> {
    let [x, y] = [0, 0]

    let bestMove: Move | null = null
    let bestScore = -Infinity
    let score = 0

    for (const [letter, node] of this.trie.root.children.entries()) {
      if (game.board[x][y] !== letter)
        continue

      for (const [nextLetter, nextNode] of node.children.entries()) {
        const lettersMetaphoneCode = metaphone.process(letter + nextLetter)
        for (const word of tokenizedBoard) {
          if (metaphone.compare(metaphone.process(word), lettersMetaphoneCode))
            score += word.length
        }

        if (nextNode.endOfWord) {
          if (game.board[x][y] === EMPTY_MARK)
            score += 2

          if (score > bestScore) {
            bestScore = score
            bestMove = new Move(this, x, y, letter)
          }
        }

        y += 1
      }

      x += 1
    }

    return bestMove
  }

  /**
 * Chooses the worst move for the opponent.
 * This is used in a choker game.
 *
 * @param {Game} game - The current game state.
 * @param {string[]} tokenizedBoard - The tokenized representation of the game board.
 * @return {Promise<Move | null>} - The best move for the opponent, or null if no move is possible.
 */
  chooseChokerMove(
    game: Game,
    tokenizedBoard: string[],
  ): Promise<Move | null> {
    // Initialize variables to store the best move and the opponent's worst score
    let bestMove: Move | null = null
    let opponentWorstScore = Infinity

    // Iterate through each row and column of the game board
    game.board.forEach((row, x) => {
      row.forEach((slot, y) => {
        if (slot === EMPTY_MARK) {
          // Only consider empty slots

          // Try to place each letter on the empty slot
          for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i) // Convert index to letter

            // Temporarily place the letter on the board
            game.board[x][y] = letter

            // Check every possible response by the opponent
            let opponentBestScore = -Infinity

            // Iterate through each row and column of the game board for the opponent's move
            game.board.forEach((opponentRow, opponentX) => {
              opponentRow.forEach((opponentSlot, opponentY) => {
                if (opponentSlot === EMPTY_MARK) {
                  // Only consider empty slots for the opponent's move

                  // Try all possible letters for the opponent
                  for (let j = 0; j < 26; j++) {
                    const opponentLetter = String.fromCharCode(65 + j) // Convert index to letter

                    // Temporarily place the opponent's letter on the board
                    game.board[opponentX][opponentY] = opponentLetter

                    // Evaluate the current board state
                    const score = this.evaluateBoard(game, tokenizedBoard)

                    // Update the opponent's best score
                    if (score > opponentBestScore)
                      opponentBestScore = score

                    // Remove the opponent's temporarily placed letter from the board
                    game.board[opponentX][opponentY] = EMPTY_MARK
                  }
                }
              })
            })

            // If this move results in a worse possible move for the opponent, store it as the best move so far
            if (opponentBestScore < opponentWorstScore) {
              opponentWorstScore = opponentBestScore
              bestMove = new Move(this, x, y, letter)
            }

            // Remove the temporarily placed letter from the board
            game.board[x][y] = EMPTY_MARK
          }
        }
      })
    })

    // Return the best move as a Promise
    return Promise.resolve(bestMove)
  }

  /**
  * Evaluates the score of the given board based on the game rules.
  *
  * @param {Game} game - the game object with the board and its properties.
  * @param {string[]} tokenizedBoard - an array of words to search for on the board.
  * @return {number} the score of the board based on the found words.
  */
  evaluateBoard(game: Game, tokenizedBoard: string[]): number {
    let score = 0 // Initialize score to 0

    // Loop through each row of the board
    for (let x = 0; x < game.size; x++) {
      // Loop through each column of the board
      for (let y = 0; y < game.size; y++) {
        // Check if the current cell is not empty
        if (game.board[x][y] !== EMPTY_MARK) {
          const letter = game.board[x][y] // Get the letter in the current cell
          const lettersMetaphoneCode = metaphone.process(letter) // Get the metaphone code of the letter

          // Loop through each word in the tokenized board
          tokenizedBoard.forEach((word) => {
            // Check if the metaphone code of the word matches the metaphone code of the letter
            if (metaphone.compare(metaphone.process(word), lettersMetaphoneCode))
              score += word.length // Increase the score by the length of the word
          })
        }
      }
    }

    return score // Return the final score
  }
}

export { Move, Player, Bot }