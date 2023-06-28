import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'

class TrieNode {
  children: Map<string, TrieNode>
  endOfWord: boolean

  constructor() {
    this.children = new Map<string, TrieNode>()
    this.endOfWord = false
  }
}

class Trie {
  root: TrieNode
  constructor() {
    this.root = new TrieNode()
  }

  addWord(word: string): void {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char))
        node.children.set(char, new TrieNode())
      node = node.children.get(char)!
    }
    node.endOfWord = true
  }

  searchWord(word: string): boolean {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char))
        return false
      node = node.children.get(char)!
    }
    return node.endOfWord
  }
}

async function createDictionary(path: string) {
  const fileStream = createReadStream(resolve(path))
  const readline = createInterface({ input: fileStream })
  const trie = new Trie()
  for await (const line of readline)
    trie.addWord(line.trim().toUpperCase())
  return trie
}

export { Trie, createDictionary }
