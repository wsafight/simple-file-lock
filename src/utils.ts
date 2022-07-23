export type MethodCallback = (...args: any[]) => void

interface MethodHandlerParams {
  success?: MethodCallback
  fail?: MethodCallback
  complete?: MethodCallback
}


const resultFun = <T>(res: T) => res

class MethodHandler {
  private readonly _success: MethodCallback = resultFun
  private readonly _fail: MethodCallback = resultFun
  private readonly _complete: MethodCallback = resultFun

  constructor({ success, fail, complete }: MethodHandlerParams) {
    if (typeof success === 'function') {
      this._success = success
    }

    if (typeof fail === 'function') {
      this._fail = fail
    }

    if (typeof complete === 'function') {
      this._complete = complete
    }
  }

  success(result = {}, resolve = Promise.resolve.bind(Promise)) {
    this._success(result)
    this._complete(result)
    return resolve(result)
  }

  fail(reason = {}, reject = Promise.reject.bind(Promise)) {
    this._fail(reason)
    this._complete(reason)
    return reject(reason)
  }
}

const resolvePromiseFun = (promiseFun: () => Promise<any>) => {
  return new Promise(resolve => {
    promiseFun().then(() => {
      resolve(true)
    }).catch(() => {
      resolve(false)
    })
  })
}


export {
  resolvePromiseFun,
  MethodHandler
} 