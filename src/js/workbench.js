import qlik from 'js/qlik'
import { window } from 'global'

// A workaround for webpack's underscore var prefixing
window.qlik = qlik

// @preserve //callbacks -- inserted here --
// @preserve //open apps -- inserted here --
// @preserve //get objects -- inserted here --
// @preserve //create cubes and lists -- inserted here --

console.log(qlik)
