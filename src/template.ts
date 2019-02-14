import * as _ from './util/underscore'
import * as path from 'path'
import { anySeries } from './util/promise'
import * as fs from 'fs'

const statFileAsync = <(filepath: string) => Promise<object>>_.promisify(fs.stat)
const readFileAsync = <(filepath: string, encoding: string) => Promise<string>>_.promisify(fs.readFile)

export async function resolve (filepath, root, options) {
  if (!path.extname(filepath)) {
    filepath += options.extname
  }
  root = options.root.concat(root || [])
  root = _.uniq(root)
  const paths = root.map(root => path.resolve(root, filepath))
  return anySeries(paths, async path => {
    try {
      await statFileAsync(path)
      return path
    } catch (e) {
      e.message = `${e.code}: Failed to lookup ${filepath} in: ${root}`
      throw e
    }
  })
}

export async function read (filepath): Promise<string> {
  return readFileAsync(filepath, 'utf8')
}
