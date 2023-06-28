import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { resolve } from 'node:path'

class Node {
  children: Map<string, Node>
  endOfWord: boolean

  constructor() {
    this.children = new Map<string, Node>()
    this.endOfWord = false
  }
}

class Trie {
  root: Node

  constructor() {
    this.root = new Node()
  }

  addWord(word: string): void {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char))
        node.children.set(char, new Node())
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

  static async createDictionary(path: string) {
    const fileStream = createReadStream(resolve(path))
    const readline = createInterface({ input: fileStream })
    const trie = new Trie()
    for await (const line of readline)
      trie.addWord(line.trim().toUpperCase())

    return trie
  }
}

export { Trie }
