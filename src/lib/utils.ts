import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'
import { Trie } from './trie'

type Position = [x: number, y: number]

const EMPTY_MARK = '_'
const DIRECTIONS: Position[] = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
]

async function createDictionary(path: string) {
  const fileStream = createReadStream(resolve(path))
  const readline = createInterface({ input: fileStream })
  const trie = new Trie()
  for await (const line of readline)
    trie.addWord(line.trim().toUpperCase())
  return trie
}

export {
  EMPTY_MARK,
  DIRECTIONS,
  createDictionary,
  type Position,
}
