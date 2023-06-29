import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'

import { Trie } from './trie'

type Position = [x: number, y: number]

/**
 * Convert uppercase Russian characters (А-Я) to Uint8Array.
 *
 * @param {string} str - The input string to convert.
 * @returns {Uint8Array} - The converted Uint8Array.
 */
function toUint8Array(str: string): Uint8Array {
  const array = new Uint8Array(str.length * 2)
  for (let i = 0; i < str.length; i++)
    array[i] = str.charCodeAt(i) - 0x410
  return array
}

async function createDictionary(path: string) {
  const fileStream = createReadStream(resolve(path))
  const readline = createInterface({ input: fileStream })
  const trie = new Trie()
  for await (const line of readline)
    trie.addWord(line.trim().toUpperCase())
  return trie
}

export {
  Position,
  createDictionary,
}
