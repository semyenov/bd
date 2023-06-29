import { consola } from 'consola'
import { Bot, Game, createDictionary } from '@/lib'

const logger = consola.create({ defaults: { tag: 'main' } })

async function main() {
  const dictionary = await createDictionary('./dictionary.txt')

  const bot1 = new Bot('player1', dictionary)
  const bot2 = new Bot('player2', dictionary)

  const game = new Game('game1', [bot1, bot2], 5, 'балда')

  for await (const move of game.next())
    consola.log(move)
}

main()
  .catch(logger.error)
