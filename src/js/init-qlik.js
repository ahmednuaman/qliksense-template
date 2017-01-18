import { window } from 'global'

export default () => {
  const initQlikComps = window.initQlikComps
  if (initQlikComps && typeof initQlikComps === 'function') {
    initQlikComps.call(window)
  }
}
