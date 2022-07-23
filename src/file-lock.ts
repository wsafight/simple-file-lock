import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises';
import { resolvePromiseFun, MethodHandler, MethodCallback } from './utils'

export interface SimpleFileLockParams {
  lockDir: string
}

class SimpleFileLock {
  private readonly lockDir: string
  private readonly hasDir: boolean
  private locking: boolean = false


  constructor({ lockDir }: SimpleFileLockParams) {
    this.hasDir = existsSync(lockDir)
    if (!this.hasDir) {
      mkdirSync(lockDir, { recursive: true })
    }
    this.lockDir = lockDir

    process.on('exit', () => {
      const { locking, lockDir, hasDir } = this
      if (!lockDir) {
        return
      }
      if (!locking) {
        return
      }

      const filePath = this.getFilePath()
      if (!filePath) {
        return
      }

      rmSync(filePath)
      if (!hasDir) {
        rmSync(lockDir, { recursive: true, maxRetries: 3 })
      }

    })
  }

  getFilePath(): string {
    return `${this.lockDir}/${process.pid}`
  }


  lock(cb: MethodCallback) {
    if (!this.lockDir) {
      throw new Error('Folder does not exist')
    }

    const handleLock = new MethodHandler({ success: cb })

    if (this.locking) {
      return handleLock.success()
    }

    const filePath = this.getFilePath()

    return resolvePromiseFun(() => mkdir(filePath)).then(isSuccess => {
      if (!isSuccess) {
        return handleLock.fail()
      }
      this.locking = true
      return handleLock.success()
    })
  }

  unlock(cb: MethodCallback) {
    if (!this.lockDir) {
      throw new Error('Folder does not exist')
    }

    const handleUnLock = new MethodHandler({ success: cb })

    if (!this.locking) {
      return handleUnLock.success()
    }


    const filePath = this.getFilePath()
    return resolvePromiseFun(() => rm(filePath)).then(isSuccess => {
      if (!isSuccess) {
        return handleUnLock.fail()
      }
      this.locking = false
      return handleUnLock.success()
    })
  }
}

export default SimpleFileLock