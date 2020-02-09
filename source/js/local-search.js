/* global CONFIG */

window.addEventListener('DOMContentLoaded', () => {
  // Popup Window
  let isfetched = false;
  let datas;
  let isXml = true;
  // Search DB path
  let searchPath = CONFIG.path;
  if (searchPath.length === 0) {
    searchPath = 'search.xml';
  } else if (/json$/i.test(searchPath)) {
    isXml = false;
  }
  const path = CONFIG.root + searchPath;
  const input = document.getElementById('search-input');
  const resultContent = document.getElementById('search-result');

  // Ref: https://github.com/ForbesLindesay/unescape-html
  const unescapeHtml = html => {
    return String(html)
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, '\'')
      .replace(/&#x3A;/g, ':')
      // Replace all the other &#x; chars
      .replace(/&#(\d+);/g, (m, p) => {
        return String.fromCharCode(p);
      })
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  };

  const getIndexByWord = (word, text, caseSensitive) => {
    let wordLen = word.length;
    if (wordLen === 0) return [];
    let startPosition = 0;
    let position = [];
    let index = [];
    if (!caseSensitive) {
      text = text.toLowerCase();
      word = word.toLowerCase();
    }
    while ((position = text.indexOf(word, startPosition)) > -1) {
      index.push({
        position: position,
        word    : word
      });
      startPosition = position + wordLen;
    }
    return index;
  };

  // Merge hits into slices
  const mergeIntoSlice = (start, end, index, searchText) => {
    let item = index[index.length - 1];
    let { position, word } = item;
    let hits = [];
    let searchTextCountInSlice = 0;
    while (position + word.length <= end && index.length !== 0) {
      if (word === searchText) {
        searchTextCountInSlice++;
      }
      hits.push({
        position: position,
        length  : word.length
      });
      let wordEnd = position + word.length;

      // Move to next position of hit
      index.pop();
      while (index.length !== 0) {
        item = index[index.length - 1];
        position = item.position;
        word = item.word;
        if (wordEnd > position) {
          index.pop();
        } else {
          break;
        }
      }
    }
    return {
      hits,
      start,
      end,
      searchTextCount: searchTextCountInSlice
    };
  };

  // Highlight title and content
  const highlightKeyword = (text, slice) => {
    let result = '';
    let prevEnd = slice.start;
    slice.hits.forEach(hit => {
      result += text.substring(prevEnd, hit.position);
      let end = hit.position + hit.length;
      result += `<b class="search-keyword">${text.substring(hit.position, end)}</b>`;
      prevEnd = end;
    });
    result += text.substring(prevEnd, slice.end);
    return result;
  };

  const inputEventFunction = () => {
    var searchText = input.value.trim().toLowerCase();
    var keywords = searchText.split(/[\s\-]+/);
    if (keywords.length > 1) {
      keywords.push(searchText);
    }
    var resultItems = [];
    if (searchText.length > 0) {
      // perform local searching
      datas.forEach(function(data) {
        if (!data.title) return;
        var isMatch = false;
        var hitCount = 0;
        var searchTextCount = 0;
        var title = data.title.trim();
        var titleInLowerCase = title.toLowerCase();
        var content = data.content.trim().replace(/<[^>]+>/g,"");
        var content = data.content;
        var contentInLowerCase = content.toLowerCase();
        var articleUrl = decodeURIComponent(data.url);
        var indexOfTitle = [];
        var indexOfContent = [];
        // only match articles with not empty titles
        if(title != '') {
          keywords.forEach(function(keyword) {
            function getIndexByWord(word, text, caseSensitive) {
              var wordLen = word.length;
              if (wordLen === 0) {
                return [];
              }
              var startPosition = 0, position = [], index = [];
              if (!caseSensitive) {
                text = text.toLowerCase();
                word = word.toLowerCase();
              }
              while ((position = text.indexOf(word, startPosition)) > -1) {
                index.push({position: position, word: word});
                startPosition = position + wordLen;
              }
              return index;
            }

            indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, titleInLowerCase, false));
            indexOfContent = indexOfContent.concat(getIndexByWord(keyword, contentInLowerCase, false));
          });
          if (indexOfTitle.length > 0 || indexOfContent.length > 0) {
            isMatch = true;
            hitCount = indexOfTitle.length + indexOfContent.length;
          }
        }

        // show search results

        if (isMatch) {
          // sort index by position of keyword

          [indexOfTitle, indexOfContent].forEach(function (index) {
            index.sort(function (itemLeft, itemRight) {
              if (itemRight.position !== itemLeft.position) {
                return itemRight.position - itemLeft.position;
              } else {
                return itemLeft.word.length - itemRight.word.length;
              }
            });
          });

          // merge hits into slices

          function mergeIntoSlice(text, start, end, index) {
            var item = index[index.length - 1];
            var position = item.position;
            var word = item.word;
            var hits = [];
            var searchTextCountInSlice = 0;
            while (position + word.length <= end && index.length != 0) {
              if (word === searchText) {
                searchTextCountInSlice++;
              }
              hits.push({position: position, length: word.length});
              var wordEnd = position + word.length;

              // move to next position of hit

              index.pop();
              while (index.length != 0) {
                item = index[index.length - 1];
                position = item.position;
                word = item.word;
                if (wordEnd > position) {
                  index.pop();
                } else {
                  break;
                }
              }
            }
            searchTextCount += searchTextCountInSlice;
            return {
              hits: hits,
              start: start,
              end: end,
              searchTextCount: searchTextCountInSlice
            };
          }

          var slicesOfTitle = [];
          if (indexOfTitle.length != 0) {
            slicesOfTitle.push(mergeIntoSlice(title, 0, title.length, indexOfTitle));
          }

          var slicesOfContent = [];
          while (indexOfContent.length != 0) {
            var item = indexOfContent[indexOfContent.length - 1];
            var position = item.position;
            var word = item.word;
            // cut out 100 characters
            var start = position - 20;
            var end = position + 80;
            if(start < 0){
              start = 0;
            }
            if (end < position + word.length) {
              end = position + word.length;
            }
            if(end > content.length){
              end = content.length;
            }
            slicesOfContent.push(mergeIntoSlice(content, start, end, indexOfContent));
          }

          // sort slices in content by search text's count and hits' count

          slicesOfContent.sort(function (sliceLeft, sliceRight) {
            if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
              return sliceRight.searchTextCount - sliceLeft.searchTextCount;
            } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
              return sliceRight.hits.length - sliceLeft.hits.length;
            } else {
              return sliceLeft.start - sliceRight.start;
            }
          });

          // select top N slices in content

          var upperBound = parseInt(CONFIG.localsearch.top_n_per_article, 10);
          if (upperBound >= 0) {
            slicesOfContent = slicesOfContent.slice(0, upperBound);
          }

          // highlight title and content

          function highlightKeyword(text, slice) {
            var result = '';
            var prevEnd = slice.start;
            slice.hits.forEach(function (hit) {
              result += text.substring(prevEnd, hit.position);
              var end = hit.position + hit.length;
              result += '<b class="search-keyword">' + text.substring(hit.position, end) + '</b>';
              prevEnd = end;
            });
            result += text.substring(prevEnd, slice.end);
            return result;
          }

          var resultItem = '';

          if (slicesOfTitle.length != 0) {
            resultItem += "<li><a href='" + articleUrl + "' class='search-result-title'>" + highlightKeyword(title, slicesOfTitle[0]) + "</a>";
          } else {
            resultItem += "<li><a href='" + articleUrl + "' class='search-result-title'>" + title + "</a>";
          }

          slicesOfContent.forEach(function (slice) {
            resultItem += "<a href='" + articleUrl + "'>" +
              "<p class=\"search-result\">" + highlightKeyword(content, slice) +
              "...</p>" + "</a>";
          });

          resultItem += "</li>";
          resultItems.push({
            item: resultItem,
            searchTextCount: searchTextCount,
            hitCount: hitCount,
            id: resultItems.length
          });
        }
      })
    };
    if (keywords.length === 1 && keywords[0] === "") {
      resultContent.innerHTML = '<div id="no-result"><i class="fa fa-search fa-5x" /></div>'
    } else if (resultItems.length === 0) {
      resultContent.innerHTML = '<div id="no-result"><i class="fa fa-frown-o fa-5x" /></div>'
    } else {
      resultItems.sort(function (resultLeft, resultRight) {
        if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
          return resultRight.searchTextCount - resultLeft.searchTextCount;
        } else if (resultLeft.hitCount !== resultRight.hitCount) {
          return resultRight.hitCount - resultLeft.hitCount;
        } else {
          return resultRight.id - resultLeft.id;
        }
      });
      var searchResultList = '<ul class=\"search-result-list\">';
      resultItems.forEach(function (result) {
        searchResultList += result.item;
      })
      searchResultList += "</ul>";
      resultContent.innerHTML = searchResultList;
    }
  }

  const fetchData = callback => {
    fetch(path)
      .then(response => response.text())
      .then(res => {
        // Get the contents from search data
        isfetched = true;
        datas = isXml ? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element => {
          return {
            title  : element.querySelector('title').innerHTML,
            content: element.querySelector('content').innerHTML,
            url    : element.querySelector('url').innerHTML
          };
        }) : JSON.parse(res);

        // Remove loading animation
        document.querySelector('.search-pop-overlay').innerHTML = '';
        document.body.style.overflow = '';

        if (callback) {
          callback();
        }
      });
  };

  if (CONFIG.localsearch.preload) {
    fetchData();
  }

  const proceedSearch = () => {
    document.body.style.overflow = 'hidden';
    document.querySelector('.search-pop-overlay').style.display = 'block';
    document.querySelector('.popup').style.display = 'block';
    document.getElementById('search-input').focus();
  };

  // Search function
  const searchFunc = () => {
    document.querySelector('.search-pop-overlay').style.display = '';
    document.querySelector('.search-pop-overlay').innerHTML = '<div class="search-loading-icon"><i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i></div>';
    fetchData(proceedSearch);
  };

  if (CONFIG.localsearch.trigger === 'auto') {
    input.addEventListener('input', inputEventFunction);
  } else {
    document.querySelector('.search-icon').addEventListener('click', inputEventFunction);
    input.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        inputEventFunction();
      }
    });
  }

  // Handle and trigger popup window
  document.querySelector('.popup-trigger').addEventListener('click', () => {
    if (isfetched === false) {
      searchFunc();
    } else {
      proceedSearch();
    }
  });

  // Monitor main search box
  const onPopupClose = () => {
    document.body.style.overflow = '';
    document.querySelector('.search-pop-overlay').style.display = 'none';
    document.querySelector('.popup').style.display = 'none';
  };

  document.querySelector('.search-pop-overlay').addEventListener('click', onPopupClose);
  document.querySelector('.popup-btn-close').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', event => {
    if (event.which === 27) {
      onPopupClose();
    }
  });
});
