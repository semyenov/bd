import type { Board, Game } from '../game'
import type { Position } from '../utils'
import { Player } from './player'

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

class Move {
  private readonly _board: Board

  private _path: Position[]
  private _word: string

  get position(): Position {
    return this._path[this._path.length - 1]
  }

  constructor(
    board: Board,
    position: Position,
  ) {
    this._board = board
    this._path = [position]
    this._word = ''
  }

  // async next(
  //   letters: string[] = [],
  //   start: Position = this.position,
  //   word = '',
  // ): Promise<Position[]> {
  //   return DIRECTIONS.map((direction) => {
  //     return this._board.get(
  //       [start[0] + direction[0], start[1] + direction[1]],
  //     )
  //   })
  // }

  addLetter(letter: string, position: Position) {
    this._path.push(position)
    this._word += letter
  }
}

class Bot extends Player {
  async move(
    game: Game,
  ): Promise<Move | null> {
    const move = new Move(game.board, [0, 0])
    return move.next()
  }
}

export { Player, Bot }
