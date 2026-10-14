import bcrypt from 'bcryptjs'

async function readHiddenPassword() {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    throw new Error('Run this command in an interactive terminal so the password can be entered without echo.')
  }

  process.stdout.write('Admin password (input hidden): ')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  let password = ''

  return await new Promise<string>((resolve, reject) => {
    const finish = (error?: Error) => {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener('data', onData)
      process.stdout.write('\n')
      if (error) reject(error)
      else resolve(password)
    }

    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          finish(new Error('Password entry cancelled.'))
          return
        }
        if (character === '\r' || character === '\n') {
          finish()
          return
        }
        if (character === '\u007f' || character === '\b') {
          password = password.slice(0, -1)
        } else {
          password += character
        }
      }
    }

    process.stdin.on('data', onData)
  })
}

try {
  const password = await readHiddenPassword()
  if (password.length < 12) throw new Error('Choose a password with at least 12 characters.')
  console.log(await bcrypt.hash(password, 12))
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Could not hash password.')
  process.exitCode = 1
}
