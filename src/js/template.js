/* global process */

import $ from 'jquery'
import body from 'pug/_body'
import head from 'pug/_head'

const production = process.env.NODE_ENV === 'production'

$('head').append(head({ production }))
$('#body').append(body({ production }))
