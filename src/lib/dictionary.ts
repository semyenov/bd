import { resolve } from 'node:path'
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

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
    let currentNode = this.root
    for (const char of word) {
      if (!currentNode.children.has(char))
        currentNode.children.set(char, new TrieNode())

      currentNode = currentNode.children.get(char)!
    }
    currentNode.endOfWord = true
  }

  searchWord(word: string): boolean {
    let currentNode = this.root
    for (const char of word) {
      if (!currentNode.children.has(char))
        return false

      currentNode = currentNode.children.get(char)!
    }
    return currentNode.endOfWord
  }
}

async function processLineByLine(path: string) {
  const fileStream = createReadStream(resolve(path))
  const rl = createInterface({
    input: fileStream,
  })

  const trie = new Trie()

  for await (const line of rl)
    trie.addWord(line.trim())

  return trie
}

export { Trie, processLineByLine }
