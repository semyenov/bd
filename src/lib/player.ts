import type { Game } from './game'
import type { Trie } from './trie'

import type { Position } from './utils'
import { EMPTY_MARK } from './utils'

abstract class Player {
  private readonly trie: Trie

  public readonly id: string
  public score: number

  constructor(name: string, trie: Trie) {
    // Initializes a trie for the player
    this.trie = trie
    this.id = name

    this.score = 0
  }

  abstract async move(game: Game): Promise<Move | null>
}

type MoveStrategy = 'easy' | 'hard' | 'choke'
class Move {
  public readonly playerId: Player['id']
  strategy: MoveStrategy
  path: Position[]
  word: string

  get position(): Position {
    return this.path[this.path.length - 1]
  }

  constructor(playerId: Player['id'], start: Position, strateqy: MoveStrategy = 'easy') {
    this.playerId = playerId
    this.strategy = strateqy
    this.path = [start]
    this.word = ''
  }

  async dsl(strategy: MoveStrategy): Promise<Move | null> {
    switch (strategy) {
      case 'easy': return chooseRandomMove(game)
      case 'hard': return chooseBestMove(game)
      case 'choke': return chooseChokerMove(game)
      default: throw new Error('Invalid move strategy')
    }
  }

  addLetter(letter: string, position: Position) {
    this.path.push(position)
    this.word += letter
  }
}


class Bot extends Player {
  constructor(name: string, trie: Trie) {
    super(name, trie)
  }

  /**
   * Makes a move in the game using the specified strategy.
   *
   * @param {Game} game - The game object.
   * @param {MoveStrategy} [strategy='easy'] - The move strategy to use (default: 'easy').
   * @return {Promise<Move | null>} A promise that resolves to the chosen move, or null if no move was made.
   */
  async move(
    game: Game,
    strategy: MoveStrategy = 'hard',
  ): Promise<Move | null> {
    const move = new Move(this.id, [0, 0], strategy)
  }


  /**
   * Chooses a random move from the available empty spots on the game board.
   *
   * @param {Game} game - The game object.
   * @return {Promise<Move | null>} A promise that resolves to a Move object or null if no valid moves are available.
   */
  async chooseRandomMove(game: Game): Promise<Move | null> {
    const emptySpots: { x: number; y: number }[] = []
    for (let i = 0; i < game.size; i++) {
      for (let j = 0; j < game.size; j++) {
        if (game.board[i]![j] === EMPTY_MARK)
          emptySpots.push({ x: i, y: j })
      }
    }
  }

  // If there are no valid moves available, return null
  if(emptySpots.length === 0) return null

// Randomly pick a spot from the list
const randomIndex = Math.floor(Math.random() * emptySpots.length)
const randomSpot = emptySpots[randomIndex]
if (!randomSpot)
  return null

// const similarWords = tokenizedBoard.filter(word =>
//   metaphone.compare(
//     metaphone.process(word),
//     metaphone.process(String.fromCharCode(65 + letterIndex)),
//   ),
// )

const letterIndex = Math.floor(Math.random() * 26)
const letter = String.fromCharCode(65 + letterIndex)
const { x, y } = randomSpot

return new Move(this, [x, y])
}


/**
 * Finds the best move to make in the game.
 *
 * @param {Game} game - The game object representing the current game state.
 * @return {Promise<Move | null>} A promise that resolves to the best move to make, or null if no move is found.
 */
async function chooseBestMove(game: Game): Promise<Move | null> {
  let [xччч, ввв] = [0, 0]

  let bestMove: Move | null = null
  let bestScore = -Infinity
  let score = 0

  for (const [letter, node] of this.trie.root.children.entries()) {
    if (game.board[xччч][ввв] !== letter)
      continue

    for (const [nextLetter, nextNode] of node.children.entries()) {
      for (const word of tokenizedBoard) {
        if (metaphone.compare(metaphone.process(word), lettersMetaphoneCode))
          score += word.length
      }

      if (nextNode.endOfWord) {
        if (game.board[xччч][ввв] === EMPTY_MARK)
          score += 2

        if (score > bestScore) {
          bestScore = score
          bestMove = new Move(this, xччч, ввв, letter)
        }
      }

      ввв += 1
    }

    xччч += 1
  }

  return bestMove
}

/**
* Chooses the worst move for the opponent.
* This is used in a choker game.
*
* @param {Game} game - The current game state.
* @return {Promise<Move | null>} - The best move for the opponent, or null if no move is possible.
*/
async function chooseChokerMove(
  game: Game,
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
                  const score = this.evaluateBoard(game)

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
            bestMove = new Move(game, [x, y], letter)
          }

          // Remove the temporarily placed letter from the board
          game.board[x][y] = EMPTY_MARK
        }
      }
    })
  })

  return bestMove
}

export { Move, Player, Bot }
