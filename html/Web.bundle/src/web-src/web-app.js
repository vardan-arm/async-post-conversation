const RequestMaxDuration = 4 * 1000
let timeoutIds = []
let promises = []
let promisesMap = new Map()

function generateId() {
  return Date.now()
}

function messageListenerInWeb(msg) {
  try {
    const {messageId, timeoutId} = JSON.parse(msg.data)
    alert('Data from mobile (after timeout):\r\n\r\n' + msg.data)

    const promiseWithMessageId = promisesMap.get(messageId)
    promiseWithMessageId.resolver()

    clearTimeout(timeoutId)
    promisesMap.delete(messageId)
  } catch (error) {
    alert('An error has occurred while receiving message from mobile: ' + error)
  }
}

async function caller() {
  alert('Sending data to Mobile...')

  await asyncPostMessage()

  alert('This should be printed after the promise has resolved')
}

async function asyncPostMessage() {
  let timeoutId = null
  const promiseId = generateId()

  const payload = {
    messageId: promiseId,
    data: {
      key1: 'val 1',
      key2: 'val 2'
    }
  }

  const messagePromise = new Promise((resolve, reject) => {
    promisesMap.set(promiseId, {
      resolver: resolve,
    })

    timeoutId = setTimeout(() => {
      timeoutIds = timeoutIds.filter(id => id !== timeoutId)
      clearTimeout(timeoutId)

      reject('Rejected because of time out')

    }, RequestMaxDuration)

    payload.timeoutId = timeoutId;
  })
  timeoutIds.push(timeoutId)

  window.ReactNativeWebView.postMessage(JSON.stringify(payload))

  return messagePromise
}

window.addEventListener('message', messageListenerInWeb)
