import { window } from 'global'
import qlik from 'js/qlik'
import './qlik-extensions'

// A workaround for webpack's underscore var prefixing
window.qlik = qlik

// Defer the instantiation of Qlik add components
window.initQlikComps = () => {
  // @preserve //callbacks -- inserted here --
  // @preserve //open apps -- inserted here --
  // @preserve //get objects -- inserted here --
  // @preserve //create cubes and lists -- inserted here --
}
