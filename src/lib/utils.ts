import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'
import { Trie } from './trie'

type Position = [x: number, y: number]

async function createDictionary(path: string) {
  const fileStream = createReadStream(resolve(path))
  const readline = createInterface({ input: fileStream })
  const trie = new Trie()
  for await (const line of readline)
    trie.addWord(line.trim().toUpperCase())
  return trie
}

export {
  createDictionary,
  type Position,
}
