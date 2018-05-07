const ENDPOINT = 'http://YOUR_SERVER_ENDPOINT/'

const setCookie = function (obj) {
  const cookieStr = obj.name + '=' + obj.value + '; max-age=' + obj.maxAge
  document.cookie = cookieStr
}

const appendLinkTo = function (url) {
  const linkTag = document.createElement('link')
  linkTag.rel = 'prefetch'
  linkTag.href = url
  document.head.appendChild(linkTag)
}

const getConnectionType = function () {
  return window.navigator.connection ? window.navigator.connection.effectiveType : ''
}

const getUserFlow = function () {
  const result = []
  document.cookie.split(';').forEach(c => {
    const prefix = c.trim().substr(0, 3)
    if (prefix === 'pf_') {
      result.push(c.trim())
    }
  })
  return result
}

if (!document.hidden) {
  xhr = new XMLHttpRequest()
  xhr.open('POST', ENDPOINT)
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText)
      if (data['prefetchPath'] !== '') {
        appendLinkTo(window.location.origin + data.prefetchPath)
      }
      setCookie({
        name: 'pf_' + data['pageViewId'],
        value: Math.round(new Date() / 1000),
        maxAge: 300
      })
    }
  }

  const requestBody = {
    'pagePath': window.location.pathname,
    'userFlow': getUserFlow(),
    'clientInfo': {
      'connectionType': getConnectionType(),
      'platform': window.navigator.platform,
      'language': window.navigator.language
    }
  }
  xhr.send(JSON.stringify(requestBody))
}
