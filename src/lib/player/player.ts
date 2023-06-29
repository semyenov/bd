import type { Game } from '../game'
import type { Move } from '../player'
import type { Trie } from '../trie'

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

  abstract move(game: Game): Promise<Move | null>
}

export {
  Player,
}
