import qlik from 'js/qlik'

const origOpenApp = qlik.openApp

qlik.openApps = {}
qlik.openApp = (appId, ...rest) => {
  const app = origOpenApp.apply(window, rest.concat([appId]))

  qlik.openApps[appId] = origOpenApp.apply(window, rest.concat([appId]))

  return app
}
