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

export {
  Trie,
  TrieNode,
}
