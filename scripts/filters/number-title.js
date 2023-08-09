'use strict'

let cheerio

hexo.extend.filter.register(
  'after_post_render',
  (data) => {
    console.log('number-title')
    if (!cheerio) cheerio = require('cheerio')

    const $ = cheerio.load(data.content, {
      decodeEntities: false,
    })
    const $excerpt = cheerio.load(data.excerpt, {
      decodeEntities: false,
    })

    let elHlist = $('h1,h2,h3,h4,h5,h6')
    // h1到h6的标题编号
    let h1 = '',
      h2 = '',
      h3 = '',
      h4 = '',
      h5 = '',
      h6 = '',
      // 相对于父级的第几个子标题
      h1index = 1,
      h2index = 1,
      h3index = 1,
      h4index = 1,
      h5index = 1,
      h6index = 1

    elHlist.each((i, el) => {
      // 标题编号
      let hindexString = ''
      switch ($(el).get(0).tagName) {
        case 'h1': {
          h2index = 1
          h1 = h1index
          h1index++
          hindexString = h1
          break
        }
        case 'h2': {
          h3index = 1
          h2 = h1 + '.' + h2index
          h2index++
          hindexString = h2
          break
        }
        case 'h3': {
          h4index = 1
          h3 = h2 + '.' + h3index
          h3index++
          hindexString = h3
          break
        }
        case 'h4': {
          h5index = 1
          h4 = h3 + '.' + h4index
          h4index++
          hindexString = h4
          break
        }
        case 'h5': {
          h6index = 1
          h5 = h4 + '.' + h5index
          h5index++
          hindexString = h5
          break
        }
        case 'h6': {
          h6 = h5 + '.' + h6index
          h6index++
          hindexString = h6
          break
        }
      }
      $(el).prepend(
        $('<span />')
          .addClass('post-title-index')
          .text(hindexString + '. ')
      )
    })

    data.content = $.html()
    data.excerpt = $excerpt.html()
  },
  10
)