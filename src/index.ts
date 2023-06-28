import { consola } from 'consola'
import { Bot, Game, processLineByLine } from './lib'

async function main() {
  const dictionary = await processLineByLine('./dictionary.txt')

  const bot1 = new Bot('Bot 1', dictionary)
  const bot2 = new Bot('Bot 2', dictionary)

  const game = new Game([bot1, bot2], 5, 'балда')

  consola.log('Initial state:', game.board)
  while (!game.gameOverFlag()) {
    const nextPlayer = game.getNextPlayer()
    const move = await nextPlayer.makeMove(game)

    consola.log('\nTURN', game.turn)

    if (move) {
      consola.log(nextPlayer.name, 'made a move:', move.letter, 'at', move.x, move.y)
      const success = game.addLetter(move.player, move.x, move.y, move.letter)

      if (!success)
        consola.log('INVALID MOVE!')
    }

    consola.log('Board state:', game.board)
  }

  consola.log(`\nGame over! The winner is ${game.getWinner().name}`)
}

main()
  .catch(err => consola.error(err))
  .finally(() => process.exit(0))
