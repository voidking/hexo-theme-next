'use strict';

let cheerio;

hexo.extend.filter.register(
  'after_post_render',
  (data) => {
    console.log('number-title');
    if (!cheerio) cheerio = require('cheerio');

    const $ = cheerio.load(data.content, {
      decodeEntities: false,
    });
    const $excerpt = cheerio.load(data.excerpt, {
      decodeEntities: false,
    });

    let elHlist = $('h1, h2, h3, h4, h5, h6');
    // Initialize parent indexes
    let parentIndexes = [0, 0, 0, 0, 0, 0];

    elHlist.each((i, el) => {
      const tagName = $(el).get(0).tagName.toLowerCase().trim();
      const level = parseInt(tagName[1]); // Extract the heading level from the tag name (h1, h2, etc.)

      // Update parent index for current level
      parentIndexes[level - 1]++;

      // Reset parent indexes for lower levels
      for (let j = level; j < parentIndexes.length; j++) {
        parentIndexes[j] = 0;
      }

      // Create the index string without leading zero and dot
      const indexString = parentIndexes.slice(0, level).filter(index => index !== 0).join('.') + '.';

      $(el).prepend(
        $('<span />')
          .addClass('post-title-index')
          .text(indexString === '.' ? '' : indexString + ' ')
      );
    });

    data.content = $.html();
    data.excerpt = $excerpt.html();
  },
  10
);
