// The Node Size would approximately depend
// the maximum expected branching factor / number of children
// a node might have

const NODE_SIZE = 128

/**
 * Trie implementation for indexing Russian words.
 * Optimized to efficiently find the longest possible words inside a 2D character matrix.
 * Handles only Russian characters.
 */
class TrieNode {
  private data: Uint8Array
  private children: Uint16Array

  constructor() {
    this.data = new Uint8Array(NODE_SIZE)
    this.children = new Uint16Array(NODE_SIZE)
    this.children.fill(-1)
  }

  addChild(ch: number, index: number): number {
    for (let i = 0; i < NODE_SIZE; i++) {
      if (this.children[i] === -1 || this.data[i] === ch) {
        this.data[i] = ch
        this.children[i] = index
        return i
      }
    }
    return -1
  }

  getChild(ch: number): number {
    for (let i = 0; i < NODE_SIZE; i++) {
      if (this.data[i] === ch)
        return this.children[i]
    }
    return -1
  }
}

export class Trie {
  private nodes: TrieNode[]
  private rootIndex: number
  private nextIndex: number

  constructor() {
    this.nodes = []
    this.rootIndex = this.createNode()
    this.nextIndex = 0
  }

  private createNode(): number {
    const node = new TrieNode()
    this.nodes.push(node)
    return this.nextIndex++
  }

  *findPrefix(word: string): Generator<[number, boolean], void, void> {
    let nodeIndex = this.rootIndex
    for (const ch of word) {
      nodeIndex = this.nodes[nodeIndex].getChild(ch.charCodeAt(0))
      if (nodeIndex === undefined)
        return

      if (this.nodes[nodeIndex].getChild(0) !== undefined)
        yield [nodeIndex, true]

      else
        yield [nodeIndex, false]
    }
  }

  search(word: string): boolean {
    for (const [_, isWord] of this.findPrefix(word)) {
      if (isWord)
        return true
    }

    return false
  }

  startsWith(word: string): boolean {
    return this.findPrefix(word).next().done !== true
  }

  insert(word: string) {
    let nodeIndex = this.rootIndex
    for (const ch of word) {
      const childIndex = this.nodes[nodeIndex].getChild(ch.charCodeAt(0))
      nodeIndex = (childIndex === -1) ? this.nodes[nodeIndex].addChild(ch.charCodeAt(0), this.createNode()) : childIndex
    }
    this.nodes[nodeIndex].addChild(0, -1)
  }

  searchInGrid(grid: Uint8Array[], trie: Trie): number[] {
    const rows = grid.length
    const cols = grid[0].length
    let longestWord = ''
    const directions = [[-1, 0], [1, 0], [0, 1], [0, -1]]
    let longestWordPosition: number[] = []

    function isSafe(i: number, j: number, visited: boolean[][]): boolean {
      return (
        i >= 0 && j >= 0 && i < rows && j < cols && !visited[i][j]
      )
    }

    function searchWord(
      i: number,
      j: number,
      visited: boolean[][],
      str: string,
      currentWordPosition: number[],
    ) {
      if (trie.search(str) && str.length > longestWord.length) {
        longestWord = str.slice()
        longestWordPosition = [...currentWordPosition]
      }

      if (!trie.startsWith(str))
        return

      visited[i][j] = true
      currentWordPosition.push(i * cols + j)

      for (const direction of directions) {
        const nextI = i + direction[0]
        const nextJ = j + direction[1]

        if (isSafe(nextI, nextJ, visited))
          searchWord(nextI, nextJ, visited, str + String.fromCharCode(grid[nextI][nextJ]), currentWordPosition)
      }

      visited[i][j] = false
      currentWordPosition.pop()
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
        searchWord(i, j, visited, String.fromCharCode(grid[i][j]), [])
      }
    }

    return longestWordPosition
  }
}
