import { consola } from 'consola'

import type { Player } from './player'

import type { Position } from './utils'

const EMPTY = '_'

class GameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameError'
  }
}

interface Cell {
  position: Position
  letter: string
  isEmpty: boolean
}

class Board {
  private readonly _size: number
  private _board: string[][]

  private _emptyCells: number

  get size(): number {
    return this._size
  }

  get board(): string[][] {
    return this._board
  }

  get isFull(): boolean {
    return this._emptyCells <= 0
  }

  constructor(size: number, word: string) {
    this._size = size
    this._emptyCells = size * size - word.length

    this._board = Array.from(
      { length: size },
      () => Array(size).fill(EMPTY),
    )
    this.init(word)
  }

  init(word: string) {
    if (word) {
      const wordStart: Position = [
        Math.floor(this._size / 2),
        Math.floor(this._size / 2) - Math.floor(word.length / 2),
      ]
      for (let j = 0; j < word.length; j++)
        this.set(word[j], [wordStart[0], wordStart[1] + j])
    }
  }

  set(letter: string, position: Position): boolean {
    const cell = this.get(position)
    if (cell && cell.letter === EMPTY) {
      this._board[position[0]][position[1]] = letter
      this._emptyCells--

      return true
    }

    return false
  }

  get(position: Position): Cell | null {
    // out of bounds
    if (
      position[0] < 0 || position[0] >= this.size
      || position[1] < 0 || position[1] >= this.size
    )
      return null

    const letter = this.board[position[0]][position[1]]
    return {
      letter,
      position,

      isEmpty: letter === EMPTY,
    }
  }
}

interface GameState {
  board: Board
  players: Player[]

  status: 'playing' | 'over'
}

class Game {
  private readonly _id: string
  private readonly _players: Player[]

  private _turn: number
  private _board: Board

  get turn(): number {
    return this._turn
  }

  get board(): Board {
    return this._board
  }

  constructor(id: string, players: Player[], size: number, word: string) {
    this._id = id
    this._players = players

    // Start with the first player
    this._turn = 0
    this._board = new Board(size, word)
  }

  async *next(): AsyncGenerator<void> {
    let skipped = 0
    while (!this._board.isFull && skipped < 2) {
      const player = this.getPlayer()
      const move = await player.move(this)
      this._turn++

      if (!move) {
        skipped++
        continue
      }

      skipped = 0
      yield move
    }

    const state = this.getState()
    consola.info('State:', state)
  }

  getPlayer(): Player {
    return this._players[this._turn % this._players.length]!
  }

  getState(): GameState {
    return {
      status: 'playing',
      board: this._board,
      players: this._players,
    }
  }
}

export { Game, Board, Cell }
